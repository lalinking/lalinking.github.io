# Spring-Cloud 微服务学习日志

[TOC]

## 概要知识点

微服务架构即将一个复杂的业务流程拆分成若干个部分，每个部分再通过 http RESTful api 串联起来组成完整业务流程。

这样的设计优点是：

1. 复杂业务流程完成了分解，每个部分的业务逻辑变得简单，适合团队协作。
2. 每个部分可能需要的机器算力不一致，可灵活部署机器数量，节省运营成本。
3. 单个部分业务逻辑变动不再需要调整、重新发布整个业务，运营成本提升。

但也产生了麻烦，如果没有一套针对微服务的框架，开发过程中会增加无关业务的代码来协调各个环节的连结。因此产生了类似于 spring-cloud 的微服务框架。

spring-cloud 微服务架构中主要有3个角色，并有一系列保障服务或方便开发、维护的工具或组件。

1. 服务供应者：提供某个服务。
2. 服务调用者：调用某个服务。
3. 服务注册中心：将供应者和调用者联系起来，让调用者能正确找到供应者。

```mermaid
flowchart TB
  subgraph center[<br/> 服务注册中心集群]
    center1[服务注册中心1]
    center2[服务注册中心2]
    center1 --> center2
    center2 --> center1
  end

  subgraph provider[ ]
    provider1[服务供应者1]
    provider2[服务供应者2]
    provider3[服务供应者3]
  end
    
    provider1 --注册<b>服务名</b>--> center
    provider2 --注册<b>服务名</b>--> center
    provider3 --注册<b>服务名</b>--> center
    
    caller1[调用者]

    caller1 --1.通过<b>服务名</b>咨询服务具体地址--> center
    caller1 --2.通过<b>负载均衡</b>调用服务--> provider
    
```

## 搭建 Spring-Cloud 微服务

Spring-Cloud 中各个角色、工具或组件都可以基于 Spring-Boot 来快速搭建。以下通过 Spring-Cloud 来实现 “专辑元数据入库” 功能。

相关项目：

1. eureka-server，作为服务管理中心
2. receiver-metadata，负责接收元数据入库，作为服务供应者
3. pusher-metadata，元数据发送端，作为服务调用者
4. model，公用的 model 类，定义元数据的传送格式

### 建立 Parent 项目统一管理依赖包版本

为了统一管理 Spring 以及各三方依赖包的版本号，建立一个空的 parent 项目，在此项目中统一管理各个依赖包的版本，以及引入共用的依赖包。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <packaging>pom</packaging>
    <groupId>com.ultimate</groupId>
    <artifactId>springcloud.parrent</artifactId>
    <version>1.0-SNAPSHOT</version>

    <!--统一管理jar包版本-->
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
        <lombok.version>1.16.18</lombok.version>
        <spring.boot.version>2.2.6.RELEASE</spring.boot.version>
        <spring.cloud.version>Hoxton.SR1</spring.cloud.version>
    </properties>

    <!--此处仅定义引入包的版本号，不负责引入。子项目引入相关包时不再需要指定version-->
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring.boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring.cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <optional>true</optional>
                <version>${lombok.version}</version>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <!--引入子项目都需要的包，子项目中不再需要重复引入-->
    <dependencies>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
</project>

```



### eureka-server 服务注册中心

服务注册中心并不需要任何业务上的代码，仅需关注配置文件的内容

eureka-server pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <artifactId>eureka-server</artifactId>
    <version>1.0-SNAPSHOT</version>
    <parent>
        <groupId>com.ultimate</groupId>
        <artifactId>springcloud.parrent</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <dependencies>
        <!--eureka-server-->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
    </dependencies>

</project>
```



eureka-server 配置文件 application.yml

需关注的点：

1. 自我保护相关配置：15分钟内超过一定比例的客户端未发送心跳包，则判断是注册中心自身的网络出现了故障，此时不会移除异常客户端，但仍可以注册新的服务进来。
2. 服务续约相关配置：仅在服务端设置检索间隔，心跳间隔和续租时长都在服务供应者那设置，在注册时带到注册中心这边。
3. eureka-server 可集群部署，它需要于其他注册中心进行交互，具有服务供应者的行为。因此不难理解它也需要 eureka.client.\*、eureka.instance.\* 相关的配置项。

```yml
server:
  port: 2001

# 服务名
spring:
  application:
    name: CLOUD-EUREKA-SERVER

eureka:
  # 监控页面的 System Status: Data center
  datacenter: default
  # 监控页面的 System Status: Environment
  environment: dev

  ## 服务节点信息的相关配置
  instance:
    # 域名
    hostname: localhost
    # 是否作为 ip 的形式注册
    preferIpAddress: false
    # 服务节点发送心跳包的间隔，30秒
    leaseRenewalIntervalInSeconds: 30
    # 超过一定时间没检测到心跳包后，移除此服务节点。这个时间间隔起码要比心跳发送间隔要长
    leaseExpirationDurationInSeconds: 90
    # 服务节点的 id，必须全局唯一
    instanceId: dev-server-localhost-2001

  ## 客户端相关配置
  client:
    # 是否启用健康检查
    healthcheck:
      enabled: true

    # 是否注册到服务注册中心，成为一个服务节点
    # 如果服务注册中心是集群部署，则需要启用。单机模式设置为 false
    registerWithEureka: false
    # 是否从服务注册中心获取服务节点信息
    # 如果服务注册中心是集群部署，则需要启用。单机模式设置为 false
    fetchRegistry: false
    serviceUrl:
      # 服务注册中心的地址列表
      # 英文逗号分隔设置多个 url，单机模式指向自身即可
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka
  
  ## 服务注册中心相关配置
  server:
    # 是否开启自我保护机制
    enableSelfPreservation: true
    # 保护系数，默认 0.85，即超过 85% 客户端未心跳成功，则进入保护模式
    renewalPercentThreshold: 0.85
    # 服务节点注册成功以后，等待 5 分钟才对外显示该服务节点
#    waitTimeInMsWhenSyncEmpty: 5
    # eureka server刷新readCacheMap的时间，注意，client读取的是readCacheMap，这个时间决定了多久会把readWriteCacheMap的缓存更新到readCacheMap上
    responseCacheUpdateIntervalMs: 30000
    # eureka server缓存readWriteCacheMap失效时间，这个只有在这个时间过去后缓存才会失效，失效前不会更新，
    # 过期后从registry重新读取注册服务信息，registry是一个ConcurrentHashMap。
    # 由于启用了evict其实就用不太上改这个配置了，默认180s
    responseCacheAutoExpirationInSeconds: 180
    # 启用主动失效，并且每次主动失效检测间隔为30s。默认一分钟。
    evictionIntervalTimerInMs: 30000
```



eureka-server 启动类 EurekaServerApplication.java

```java
package com.ultimate.springcloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableEurekaServer
@SpringBootApplication
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}

```



编译、启动该项目后，访问 http://localhost:2001 可看到控制面板



### receiver-metadata 提供元数据入库服务

向服务注册中心注册一个服务节点。

receiver-metadata pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <artifactId>receiver-metadata</artifactId>
    <version>1.0-SNAPSHOT</version>
    <parent>
        <groupId>com.ultimate</groupId>
        <artifactId>springcloud.parrent</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
    </dependencies>

</project>
```



receiver-metadata 配置文件 properties.yml

```yml
server:
  port: 3001

# 服务名
spring:
  application:
    name: CLOUD-RECEIVE-METADATA

eureka:
  ## 服务节点信息的相关配置
  instance:
    # 域名
    hostname: localhost
    # 是否作为 ip 的形式注册
    preferIpAddress: true
    # 服务节点发送心跳包的间隔，30秒
    leaseRenewalIntervalInSeconds: 30
    # 超过一定时间没检测到心跳包后，移除此服务节点。这个时间间隔起码要比心跳发送间隔要长
    leaseExpirationDurationInSeconds: 90
    # 服务节点的 id，必须全局唯一
    instanceId: dev-receiver-localhost-3001

  ## 客户端相关配置
  client:
    # 是否启用 eureka 客户端。默认 true
    enabled: true
    # 是否启用健康检查，需要引入 actuator 才能开启
    healthcheck:
      enabled: true

    # 是否注册到服务注册中心，成为一个服务节点
    registerWithEureka: true
    # 是否从服务注册中心获取服务节点信息
    fetchRegistry: false
    serviceUrl:
      # 服务注册中心的地址列表
      # 英文逗号分隔设置多个 url
      defaultZone: http://localhost:2001/eureka
```



receiver-metadate 启动类 ReceiverMetadataApplication.java

```java
package com.ultimate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication
@EnableEurekaClient
public class ReceiverMetadataApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReceiverMetadataApplication.class, args);
    }
}
```



### 添加一个 http 服务接口

添加一个 http 接口作为服务的入口

```java
package com.ultimate.ctrl;

import com.ultimate.model.AlbumInfoReq;
import com.ultimate.model.AlbumInfoRes;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/album")
public class AlbumCtrl {

    // 显示版本
    @PostMapping("/update")
    public AlbumInfoRes update(@RequestBody AlbumInfoReq req) {
        AlbumInfoRes res = new AlbumInfoRes();
        res.setAlbumID(1);
        res.setAlbumName(req.getAlbumName());
        return res;
    }
}

```



编译、启动该项目后，可在注册中心的控制面板上看到已经有个服务节点在列表中。



### pusher-metadata 向入库服务推送元数据

pusher-metadata pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <artifactId>pusher-metadata</artifactId>
    <version>1.0-SNAPSHOT</version>
    <parent>
        <groupId>com.ultimate</groupId>
        <artifactId>springcloud.parrent</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>com.ultimate</groupId>
            <artifactId>model</artifactId>
        </dependency>
    </dependencies>

</project>
```



pusher-metadata 配置文件 properties.yml

```yml
server:
  port: 4001

# 服务名
spring:
  application:
    name: CLOUD-PUSHER-METADATE

eureka:
  ## 客户端相关配置
  client:
    # 是否启用 eureka 客户端。默认 true
    enabled: true
    # 是否启用健康检查
    healthcheck:
      enabled: false

    # 是否注册到服务注册中心，成为一个服务节点
    registerWithEureka: false
    # 是否从服务注册中心获取服务节点信息
    fetchRegistry: true
    # 从注册中心刷新服务节点的频率
    registryFetchIntervalSeconds: 30
    serviceUrl:
      # 服务注册中心的地址列表
      # 英文逗号分隔设置多个 url
      defaultZone: http://localhost:2001/eureka
```



### pusher-metadata  启动类

需注意启动类上配置了一个负载均衡器

```java
package com.ultimate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableEurekaClient
@EnableScheduling
public class PusherMetadataApplication {

    // 配置负载均衡器
    // Ribbon 组件、轮训算法
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    public static void main(String[] args) {
        SpringApplication.run(PusherMetadataApplication.class, args);
    }
}

```



### 调用 http 服务

需注意：

1. 是通过 RestTemplate 发起 http 请求，此时会使用负载均衡器。
2. 不再直接访问具体的域名或 ip，而是通过服务名进行访问。

```java
package com.ultimate.scheduler;

import com.ultimate.model.AlbumInfoReq;
import com.ultimate.model.AlbumInfoRes;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
public class PushMetaDataScheduler {
    @Autowired
    private RestTemplate restTemplate;

    @Scheduled(cron = "0/10 * * * * ?")
    public void pushAlbum() {
        AlbumInfoReq req = new AlbumInfoReq();
        req.setAlbumName("test 专辑名");
        AlbumInfoRes res = restTemplate.postForObject("http://CLOUD-RECEIVE-METADATA/album/update", req, AlbumInfoRes.class);
        log.info("res is: {}", res);
    }
}

```



## 一些总结

Eureka 配置项分为三大块，instance、client、server。

1. instance 描述了作为服务节点注册到服务注册中心是的一些信息。如果项目不需要注册为服务节点，则无需设置。注册中心如果是集群部署则需要这部分配置，如果是单机模式则无需配置。

2. client 描述加入微服务架构时的一些行为，包括是否将自身注册为一个服务节点，是否从注册中心拉取服务节点信息，是否向服务中心进行健康报告

3. server 注册中心的一些配置。自我保护机制、缓存刷新、失效服务节点移除频率等配置。



## 其他知识点

* 服务容错保护-Hystrix：服务监控、快速失败防止任务堆积、接口的缓存
* 声明式服务调用-Feign：代理 HTTP 请求。通过 java interface 和注解声明 http api 接口。将调用 http api 的方式变得跟调用本地方法一样。
* 分布式配置中心-Spring-Cloud-Config：通过 git/svn 来管理配置文件，并支持动态刷新、加密。

