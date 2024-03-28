### 功能说明
实现的 http 服务，支持 get、post 方法。
get 支持大文件分段加载。
post 支持 token 验证，调用指定脚本输出响应数据。目前假设所有 post 都返回 json。脚本可以是 bash、python、lua，或其他可执行文件。
支持并发数限制，支持单个请求超时设置。
主要使用 socat、dd 以及其他常用的 linux 指令。

### 使用方法

```batch
bash ./bashttpd.sh start
```

全部代码如下

```batch
#!/usr/bin/env bash

# 定义各项参数
ROOT_STATIC="/opt/wwwroot/static"
ROOT_SCRIPT="/opt/wwwroot/script"
TOKEN="ZWgWLU8R4yuiv5g"
LOG_FILE="/opt/wwwroot/log.txt"
PORT=483
TIMEOUT=30
MAX_WORKS=8

trim() {
    local var="$*"
    var=$(echo "$var" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    echo -n "$var"
}

log() {
    echo -e "$(printf '[%5d]' $PPID) $(date '+[%Y-%m-%d %H:%M:%S]') $@" >> "$LOG_FILE"
}

# 读取请求体
read_body() {
    local dura_size="$1"
    if [ -z "$dura_size" ]; then
        return
    fi
    local block_size=4096
    local count=$(( (dura_size + block_size - 1) / block_size ))
    dd bs="$block_size" count=$count 2>/dev/null
}

# 打印HTTP响应头部
print_head() {
    local code="$1"
    local type="${2:-application/octet-stream}"
    local length="${3:-0}"
    local additional_info="$4"
    log "response $code $type $length $additional_info"
    case "$code" in
        "200") echo "HTTP/1.1 200 OK" ;;
        "206") echo "HTTP/1.1 206 Partial Content" ;;
        "400") echo "HTTP/1.1 400 Bad Request" ;;
        "403") echo "HTTP/1.1 403 Forbidden" ;;
        "404") echo "HTTP/1.1 404 Not Found" ;;
        "429") echo "HTTP/1.1 429 Too Many Requests" ;;
        "500") echo "HTTP/1.1 500 Internal Server Error" ;;
        *) echo "HTTP/1.1 $code Unknown" ;;
    esac
    echo "Content-Type: $type"
    echo "Content-Length: $length"
    if [ -n "$additional_info" ]; then
        echo "$additional_info"
    fi
    echo "Connection: close"
    echo 
}

# 处理传入请求的函数
handle_request() {
    local request_headers=""
    local request_line=""
    read -r request_line
    log "$request_line"

    while IFS= read -r line; do
        line="$(trim $line)"
        # log "$line"
        request_headers+="$line"$'\n'
        if [ -z "$line" ]; then
            break
        fi
    done
    
    local request_method=$(echo "$request_line" | cut -d ' ' -f1)
    local request_path=$(echo "$request_line" | cut -d ' ' -f2)
    request_path=$(printf $(sed 's/%\([0-9A-Fa-f][0-9A-Fa-f]\)/\\x\1/g' <<<"$request_path")) 
    # 调用处理方法'
    case "$request_method" in
        "GET")
            handle_get_request "$request_path" "$request_headers"
            ;;
        "POST")
            handle_post_request "$request_path" "$request_headers" <&0
            ;;
        *)
            log ""
            print_head 405
            ;;
    esac
}

# 处理GET请求的函数（支持分段返回大文件）
handle_get_request() {
    local request_path="$1"
    local request_headers="$2"
    request_path="${request_path%%\?*}"
    request_path="${request_path%%\#*}"
    local file_path="$ROOT_STATIC$request_path"
    if [ ! -f "$file_path" ]; then
        print_head 404
        return
    fi
    file_path=$(readlink -f "$file_path")
    local content_type="$(file -b --mime-type "$file_path")"
    local content_length=$(ls -nl "$file_path" | awk '{print $5}')
    local range_start=0
    local dura_size=$((1024 * 1024 * 4))
    local range_end=$dura_size
    local range_header=""

    # 不需要 206 分段返回
    if [ "$dura_size" -ge "$content_length" ]; then
        print_head 200 "$content_type" "$content_length"
        cat "$file_path"
        return
    fi
    # 解析Range头部
    while IFS= read -r line; do
        line="$(trim "$line")"
        if [[ "$line" == *"Range:"* ]]; then
            range_header="$line"
            break
        fi
    done <<< "$request_headers"
    if [ -n "$range_header" ]; then
        range_header="${range_header##*bytes=}"
        range_header="${range_header%%$'\r'*}"
        range_start=$(echo "$range_header" | cut -d'-' -f1)
        range_end=$((range_start + dura_size))
    fi

    # 检查结束范围是否超过文件长度，如果超过则修正为文件长度减1
    if [ "$range_end" -gt "$((content_length - 1))" ]; then
        range_end=$((content_length - 1))
        dura_size=$((range_end - range_start + 1))
    fi
    print_head 206 "$content_type" "$dura_size" "Content-Range: bytes $range_start-$range_end/$content_length"
    local block_size=4096
    local count=$(( (dura_size + block_size - 1) / block_size ))
    local skip=$((range_start / block_size))
    dd if="$file_path" bs=$block_size skip=$skip count=$count 2>>/dev/null
}

# 处理POST请求的函数
handle_post_request() {
    local request_path="$1"
    local request_headers="$2"
    local token_header=""
    local content_length=""
    local request_body=""
    
    # 从请求头中查找 X-Token 和 Content-Length
    while IFS= read -r line; do
        line="$(trim "$line")"
        if [[ "$line" == *"X-Token:"* ]]; then
            token_header="$line"
        elif [[ "$line" == *"Content-Length:"* ]]; then
            content_length="$line"
        fi
    done <<< "$request_headers"

    # 检查令牌是否匹配
    if [ "$token_header" != "X-Token: $TOKEN" ]; then
        print_head 403
        return
    fi

    # 读取内容
    content_length="${content_length##*: }"
    content_length="${content_length%%$'\r'}"
    request_body=$(read_body "$content_length" <&0)

    # 执行脚本并返回结果
    local script_output
    script_output=$("$ROOT_SCRIPT$request_path" "$request_body" 2>&1)
    local script_exit_code=$?

    if [ $script_exit_code -eq 0 ]; then
        print_head 200 "application/json; charset=utf-8" $(printf '%s' "$script_output" | wc -c)
        echo -e "$script_output"
    else
        print_head 500
        log "执行 $ROOT_SCRIPT$request_path 出错: $script_output"
    fi
}

# 主入口点
if [ "$1" == "start" ]; then
    log "正在监听端口 $PORT"
    script=$(readlink -f $0)
    nohup socat TCP4-LISTEN:"$PORT",reuseaddr,fork EXEC:"timeout $TIMEOUT $script" >> "$LOG_FILE" 2>&1 &
    pid=$!
    log "服务器已启动 PID: $pid"
else
    start_time=$(date +%s)
    # 线程数控制
    current_works=$(ps -ef|grep socat|grep "socat TCP4-LISTEN:$PORT"|wc -l)
    if [ "$current_works" -ge "$MAX_WORKS" ]; then
        log "out of limit, current_works: $current_works"
        print_head 429
    else
        handle_request
    fi
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    if [ "$duration" -ge 10 ]; then
        log "use time: $duration s"
    fi
fi
```