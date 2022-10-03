## Linux 服务器下利用 grep+awk 实现按关键字搜索日志，并按线程号分组显示且支持高亮。

日志格式：

```
18:48:51.143 [http-nio-8081-exec-273] INFO  com.c.m.p.ChangeProducer:44 - 输出的日志
```

// TODO
如果输出的日志存在换行，因找不到线程号，所以换行的内容不能被搜索到。
异常日志都有换行，所以异常日志都搜索不到。

```bash
#!/bin/bash

# 找出所有日志文件
pathlist=(`find /release_sw/$1/logs/ -name "*.log" |xargs ls -1t |grep ^/` )
echo "已找到如下文件，输入文件序号"

# 搜索的关键字，后面可以重新输入
searchstr=$3
# 搜索的范围
showlines=$2
if [ ! "$showlines" ]; then
	showlines=50
	echo "$showlines"
fi

# 从文件搜索、打印结果的函数
searchfile()
{
	echo "扫描：$1"
	read -p "输入 搜索的字符串（当前为 $searchstr）: " newsearchstr
	if [ "$newsearchstr" ]; then
		searchstr="$newsearchstr"
	fi
	
	echo "搜索：$searchstr"
	# 搜索得到行号
	greplist=(`fgrep --color=never -n "$searchstr" $1 | egrep --color=never -e "^[0-9]+" -o`)
	for(( i=0; i<${#greplist[@]}; i++ ))
	do
		# 获取前后若干行的内容
		startline=$((${greplist[$i]}-$showlines))
		endline=$((${greplist[$i]}+$showlines))
		echo -e "\n\n搜索行数范围： $startline ~ $endline；$(($i/2)) / $((${#greplist[@]}/2))"
		# 获取线程号，从这一行开始，向上遍历取到第一个
		# 将这些行的内容按线程号过滤，打印出来
		awk "NR>${startline} && NR<${endline}" $1 | fgrep -C $showlines --color=always "$searchstr"
		#awk "NR>${startline} && NR<${endline}" $1 | fgrep --color=always -F "${greplist[$i+1]}" | fgrep -C $showlines --color=always "$searchstr"
	done
}

# 主函数，一直询问选择哪个文件进行搜索
doask()
{
	for(( i=1; i<=${#pathlist[@]}; i++ ))
	do
		echo $i: ${pathlist[$i-1]}
	done

	read -p "输入需要扫描的文件序号（0 退出）: " pathindex
	if [ ! $pathindex ]; then
		echo "Bye"
		exit 0
	fi
	if [ $pathindex -lt "1" ]; then
		echo "Bye"
		exit 0
	fi
	path=${pathlist[$pathindex-1]}
	if [ $path ]; then
		searchfile "$path"
	else
		echo "无效输入"
	fi
	read -p "继续搜索？（回车继续，其他则退出）: " continues
	if [ $continues ]; then
		echo "Bye"
		exit 0
	fi
	doask
}

if [ ${#pathlist[@]} > 1 ]; then
	doask
else
	searchfile "${pathlist[0]}"
fi
```