[TOC]

# Nacos 简介
nacos 是阿里集团开源的微服务组件。
它的功能列表即实现情况见 [官网链接]: https://nacos.io/zh-cn/docs/feature-list.html 。 主要功能是服务发现与配置管理。
nacos 下载地址 [github release]: https://github.com/alibaba/nacos/releases 。
nacos 配置说明：[官网链接]: https://nacos.io/zh-cn/docs/system-configurations.html 。

## 功能模块说明
1. Naming模块：服务注册与发现、健康检查（服务端探测、客户端心跳）、路由策略（权重、保护阈值、就近访问）。就近访问即配置中 CMDB Module 这一块的内容。
2. Config模块：配置管理（发布、修改、查询、监听配置）、灰度配置。不支持加密配置。支持存储在 mysql 数据库中。
3. Nacos-Sync：Nacos与Nacos服务双向同步、Nacos与Zookeeper服务双向同步、Nacos与Eureka服务双向同步、Nacos与Consul服务双向同步。

## Nacos 部署
为了方便，采用 docker 容器部署。依赖的 mysql 使用已存在的服务。
关于 docker 部署 nacos 的官方文档：https://github.com/nacos-group/nacos-docker/blob/master/README_ZH.md 。
官方镜像不方便修改 nacos 版本以及各种自定义，因此自行定制 docker 镜像。

### 自定义 Nacos Docker 镜像
dockerFile：

```
# FROM 表示基于这个镜像进行创建，下面这个镜像是适用于 jar 的最小镜像
FROM openjdk:8-jre-slim

# 指定工作路径
WORKDIR /tmp

# 把启动脚本放进容器
COPY ./boot.sh /usr/boot.sh

# 构建镜像时运行以下脚本，授予权限
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
 chmod +x /usr/boot.sh

# 声明守护端口
EXPOSE 8080
 
# docker 容器启动时运行的命令，这个脚本会将指定路径（含子路径）的 jar 包全部启动
# 遇到一个问题，docker 的机制 0 号进程退出会导致整个容器终端，因此加一个 tail -f 防止退出
CMD bash /usr/boot.sh

# 打标签
LABEL org.opencontainers.image.authors="lalinking"
```

其中 boot.sh 内容如下

```bash
#!/bin/bash

echo "================================================================================="
echo "boot start."
date

startup_file="/usr/java/workpath/on_boot.sh"
if [ ! -f $startup_file ]; then
  echo "$startup_file not exists. do initial."
  echo "#!/bin/bash"                                                     > $startup_file
  echo "set -e"                                                         >> $startup_file
  echo ""                                                               >> $startup_file
  echo "# 执行jar"                                                      >> $startup_file
  echo "#  如果路径下有 jvm.args 文件，则读取里面的参数"                >> $startup_file
  echo "#  如果没有 jvm.args 文件，则使用默认参数： -server"            >> $startup_file
  echo "runjar()"                                                       >> $startup_file
  echo "{"                                                              >> $startup_file
  echo "    run_file=\$1"                                               >> $startup_file
  echo "    run_path=\$(dirname \$run_file)"                            >> $startup_file
  echo "    jvmArgs=\"-server\""                                        >> $startup_file
  echo "    if [ -f \"\$run_path/jvm.args\" ]; then"                    >> $startup_file
  echo "        jvmArgs=\$(head -n 1 \$run_path/jvm.args)"              >> $startup_file
  echo "    fi"                                                         >> $startup_file
  echo "    echo \"run: \$1, args: \$jvmArgs\""                         >> $startup_file
  echo "	# 这里必须先 cd 到路径，不然 springboot 读取配置文件有问题" >> $startup_file
  echo "    cd /usr/java/workpath/"                                     >> $startup_file
  echo "    cd \$run_path"                                              >> $startup_file
  echo "    java \$jvmArgs -jar \$run_file >> \$run_path/vmlog 2>&1 &"  >> $startup_file
  echo "}"                                                              >> $startup_file
  echo ""                                                               >> $startup_file
  echo "cd /usr/java/workpath/"                                         >> $startup_file
  echo ""                                                               >> $startup_file
  echo "# 示例"                                                         >> $startup_file
  echo "# runjar \"/usr/java/workpath/sample.jar\""                     >> $startup_file
  echo ""                                                               >> $startup_file
  echo "# 保持容器不退出（放到最后一行）"                               >> $startup_file
  echo "tail -n 0 -f \$0"                                               >> $startup_file
  echo "empty command, exit"
  exit 0
fi

# 授予执行权限
if [ ! -x $startup_file ]; then
  echo "give +x to $startup_file"
  chmod +x $startup_file
fi

sh $startup_file
```

构建镜像
```bash
docker build -f .\Dockerfile -t jar_runner:open-jre8 .
```

### 下载 Nacos
下载地址： [github release]: https://github.com/alibaba/nacos/releases
选择最新版，目前是 2.0.3。下载得到的是一个压缩包，解压后放到 D:\docker\volume\regist_center\nacos
注意文件目录结构：
    D:\docker\volume\regist_center\nacos
    D:\docker\volume\regist_center\nacos\bin
    D:\docker\volume\regist_center\nacos\conf
    D:\docker\volume\regist_center\nacos\target
后续将 D:\docker\volume\regist_center 映射为容器内的 /usr/java/workpath/ 路径。
修改配置文件 conf/application.properties （基本上没改动，参数的作用参考注释，或上面给出的链接）

```
#
# Copyright 1999-2021 Alibaba Group Holding Ltd.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

#*************** Spring Boot Related Configurations ***************#
### Default web context path:
server.servlet.contextPath=/nacos
### Default web server port:
server.port=8080

#*************** Network Related Configurations ***************#
### If prefer hostname over ip for Nacos server addresses in cluster.conf:
# nacos.inetutils.prefer-hostname-over-ip=false

### Specify local server's IP:
# nacos.inetutils.ip-address=


#*************** Config Module Related Configurations ***************#
### If use MySQL as datasource:
# spring.datasource.platform=mysql

### Count of DB:
# db.num=1

### Connect URL of DB:
# db.url.0=jdbc:mysql://127.0.0.1:3306/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=UTC
# db.user.0=nacos
# db.password.0=nacos

### Connection pool configuration: hikariCP
db.pool.config.connectionTimeout=30000
db.pool.config.validationTimeout=10000
db.pool.config.maximumPoolSize=20
db.pool.config.minimumIdle=2

#*************** Naming Module Related Configurations ***************#

### If enable data warmup. If set to false, the server would accept request without local data preparation:
nacos.naming.data.warmup=true

### If enable the instance auto expiration, kind like of health check of instance:
# 临时实例的概念暂不清楚
nacos.naming.expireInstance=true

### Add in 2.0.0
### The interval to clean empty service, unit: milliseconds.
nacos.naming.clean.empty-service.interval=60000

### The expired time to clean empty service, unit: milliseconds.
nacos.naming.clean.empty-service.expired-time=60000

### The interval to clean expired metadata, unit: milliseconds.
nacos.naming.clean.expired-metadata.interval=5000

### The expired time to clean metadata, unit: milliseconds.
nacos.naming.clean.expired-metadata.expired-time=60000

### The delay time before push task to execute from service changed, unit: milliseconds.
nacos.naming.push.pushTaskDelay=500

### The timeout for push task execute, unit: milliseconds.
nacos.naming.push.pushTaskTimeout=5000

### The delay time for retrying failed push task, unit: milliseconds.
nacos.naming.push.pushTaskRetryDelay=1000

### Since 2.0.3
### The expired time for inactive client, unit: milliseconds.
nacos.naming.client.expired.time=180000

#*************** CMDB Module Related Configurations ***************#
### The interval to dump external CMDB in seconds:
nacos.cmdb.dumpTaskInterval=3600

### The interval of polling data change event in seconds:
nacos.cmdb.eventTaskInterval=10

### The interval of loading labels in seconds:
nacos.cmdb.labelTaskInterval=300

### If turn on data loading task:
nacos.cmdb.loadDataAtStart=false


#*************** Metrics Related Configurations ***************#
### Metrics for prometheus
#management.endpoints.web.exposure.include=*

### Metrics for elastic search
management.metrics.export.elastic.enabled=false
#management.metrics.export.elastic.host=http://localhost:9200

### Metrics for influx
management.metrics.export.influx.enabled=false
#management.metrics.export.influx.db=springboot
#management.metrics.export.influx.uri=http://localhost:8086
#management.metrics.export.influx.auto-create-db=true
#management.metrics.export.influx.consistency=one
#management.metrics.export.influx.compressed=true

#*************** Access Log Related Configurations ***************#
### If turn on the access log:
server.tomcat.accesslog.enabled=true

### The access log pattern:
server.tomcat.accesslog.pattern=%h %l %u %t "%r" %s %b %D %{User-Agent}i %{Request-Source}i

### The directory of access log:
server.tomcat.basedir=

#*************** Access Control Related Configurations ***************#
### If enable spring security, this option is deprecated in 1.2.0:
#spring.security.enabled=false

### The ignore urls of auth, is deprecated in 1.2.0:
nacos.security.ignore.urls=/,/error,/**/*.css,/**/*.js,/**/*.html,/**/*.map,/**/*.svg,/**/*.png,/**/*.ico,/console-ui/public/**,/v1/auth/**,/v1/console/health/**,/actuator/**,/v1/console/server/**

### The auth system to use, currently only 'nacos' and 'ldap' is supported:
nacos.core.auth.system.type=nacos

### If turn on auth system:
nacos.core.auth.enabled=false

### worked when nacos.core.auth.system.type=ldap，{0} is Placeholder,replace login username
# nacos.core.auth.ldap.url=ldap://localhost:389
# nacos.core.auth.ldap.userdn=cn={0},ou=user,dc=company,dc=com

### The token expiration in seconds:
nacos.core.auth.default.token.expire.seconds=18000

### The default token:
nacos.core.auth.default.token.secret.key=SecretKey012345678901234567890123456789012345678901234567890123456789

### Turn on/off caching of auth information. By turning on this switch, the update of auth information would have a 15 seconds delay.
nacos.core.auth.caching.enabled=true

### Since 1.4.1, Turn on/off white auth for user-agent: nacos-server, only for upgrade from old version.
nacos.core.auth.enable.userAgentAuthWhite=false

### Since 1.4.1, worked when nacos.core.auth.enabled=true and nacos.core.auth.enable.userAgentAuthWhite=false.
### The two properties is the white list for auth and used by identity the request from other server.
nacos.core.auth.server.identity.key=serverIdentity
nacos.core.auth.server.identity.value=security

#*************** Istio Related Configurations ***************#
### If turn on the MCP server:
nacos.istio.mcp.server.enabled=false

#*************** Core Related Configurations ***************#

### set the WorkerID manually
# nacos.core.snowflake.worker-id=

### Member-MetaData
# nacos.core.member.meta.site=
# nacos.core.member.meta.adweight=
# nacos.core.member.meta.weight=

### MemberLookup
### Addressing pattern category, If set, the priority is highest
# nacos.core.member.lookup.type=[file,address-server]
## Set the cluster list with a configuration file or command-line argument
# nacos.member.list=192.168.16.101:8847?raft_port=8807,192.168.16.101?raft_port=8808,192.168.16.101:8849?raft_port=8809
## for AddressServerMemberLookup
# Maximum number of retries to query the address server upon initialization
# nacos.core.address-server.retry=5
## Server domain name address of [address-server] mode
# address.server.domain=jmenv.tbsite.net
## Server port of [address-server] mode
# address.server.port=8080
## Request address of [address-server] mode
# address.server.url=/nacos/serverlist

#*************** JRaft Related Configurations ***************#

### Sets the Raft cluster election timeout, default value is 5 second
# nacos.core.protocol.raft.data.election_timeout_ms=5000
### Sets the amount of time the Raft snapshot will execute periodically, default is 30 minute
# nacos.core.protocol.raft.data.snapshot_interval_secs=30
### raft internal worker threads
# nacos.core.protocol.raft.data.core_thread_num=8
### Number of threads required for raft business request processing
# nacos.core.protocol.raft.data.cli_service_thread_num=4
### raft linear read strategy. Safe linear reads are used by default, that is, the Leader tenure is confirmed by heartbeat
# nacos.core.protocol.raft.data.read_index_type=ReadOnlySafe
### rpc request timeout, default 5 seconds
# nacos.core.protocol.raft.data.rpc_request_timeout_ms=5000

#*************** Distro Related Configurations ***************#

### Distro data sync delay time, when sync task delayed, task will be merged for same data key. Default 1 second.
# nacos.core.protocol.distro.data.sync.delayMs=1000

### Distro data sync timeout for one sync data, default 3 seconds.
# nacos.core.protocol.distro.data.sync.timeoutMs=3000

### Distro data sync retry delay time when sync data failed or timeout, same behavior with delayMs, default 3 seconds.
# nacos.core.protocol.distro.data.sync.retryDelayMs=3000

### Distro data verify interval time, verify synced data whether expired for a interval. Default 5 seconds.
# nacos.core.protocol.distro.data.verify.intervalMs=5000

### Distro data verify timeout for one verify, default 3 seconds.
# nacos.core.protocol.distro.data.verify.timeoutMs=3000

### Distro data load retry delay when load snapshot data failed, default 30 seconds.
# nacos.core.protocol.distro.data.load.retryDelayMs=30000
```

### 启动 Docker 容器

映射端口和路径，启动容器（我的是 win10 路径）

```bash
docker run -p 8001:8080 -v D:\docker\volume\regist_center\:/usr/java/workpath --name register_center -d jar_runner:open-jre8
```

用上面命令创建容器后会生成 D:\docker\volume\regist_center\on_boot.sh 这个文件后退出，加入一行启动 nacos 的命令：

```bash
# 如果是集群部署，去掉后面的 -m standalone
# 先 cd 到 nacos，不然会在 /usr/java/workpath 这一层就生成 tomcat 的日志文件
cd /usr/java/workpath/nacos/ && bash ./bin/startup.sh -m standalone
```

然后再启动容器，会看到生成了 logs 文件夹，查看一下 nacos/logs/start.out，看有没有报错。
第一次启动会生成各种文件，所需要的时间比较久。没有报错的话可以打开浏览器访问控制台 http://localhost:8001/nacos 用户名和密码都是 nacos

### 服务注册客户端


