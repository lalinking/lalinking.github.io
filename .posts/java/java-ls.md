[TOC]

# 各种概念、工具名词解释（持续更新）

老旧车轮就别再回顾了。

## 框架
Spring: Java开发中最常用的框架，可以自动配置、注入对象。集成了大量现成的解决方案，涵盖了数据库、定时任务、消息中间件，以及Junit测试等各方各面，J2EE开发必学框架。
Spring-Boot：以Spring为核心构建的框架，相比Spring更容易配置，不再需要通过复杂的配置文件构建项目，而且内置web容器，运行和进行本地测试方便很多。现在的企业应用基本都用Spring-boot。
Spring-Cloud：以Spring-boot为基础的微服务平台。有众多子框架，包括：服务注册与发现、配置中心、服务网关、智能路由、负载均衡、断路器、监控跟踪等等。

### 微服务相关

#### 服务治理、配置管理
Netflix-Eureka：包括服务注册中心、服务注册与服务发现
Spring-Cloud-Consul：服务治理组件 ++ 配置管理
Alibaba-Nacos：服务治理组件 ++ 配置管理
Spring-Cloud-Config：配置管理
Netflix-Archaius：配置管理

#### 客户端
Netflix-Ribbon：客户端负载均衡的服务调用组件
Netflix-Hystrix：容错管理工具，实现断路器模式，通过控制服务的节点，从而对延迟和故障提供更强大的容错能力。
Netflix-Feign：基于 Ribbon 和 Hystrix 的声明式服务调用组件。
Netflix-OpenFeign：Feign基础上的再一层封装。能解析 SpringMVC 的 RequestMapping 注解下的接口，并通过动态代理的方式产生实现类，实现类中做负载均衡并调用其他服务。一般都直接用这个，不用Feign
Netflix-Ribbon：客户端负载均衡
Alibaba-Sentinel：面向分布式服务架构的轻量级流量控制产品，把流量作为切入点，从流量控制、熔断降级、系统负载保护等多个维度保护服务的稳定性。

#### 网关、认证等
Netflix-Zuul：微服务网关，提供动态路由，访问过滤等服务。
Spring-Cloud-Security：安全认证
Spring-Cloud-Gateway：用于替换Netflix-Zuul。基于 Filter 链的方式提供了网关基本的功能：安全、监控、限流等

#### 其他
Spring-Cloud-Sleuth：分布式服务跟踪
Alibaba-Seata：微服务分布式事务解决方案。 [官方文档]: https://seata.io/zh-cn/docs/ops/deploy-guide-beginner.html 
Spring-Cloud-Stream：消息驱动微服务。用于与具体消息中间件解耦合

## 数据库

### 关系型
Oracle：付费可靠
MySQL/MariaDB：开源免费
SQL Server：微软的，只能在 windows server使用
PostgrcSQL：没用过
DB2：IBM的，与Oracle竞争

### 非关系型
Redis：Key-Value数据库。数据存储在内存中，读写性能很高，可以刷到磁盘永久存储。单线程单进程，多路IO复用。
Memcached：Key-Value数据库。数据存储在内存中。
MongoDB：文档数据库。无固定结构，不同的记录允许有不同的列数和列类型。列允许包含多值，记录允许嵌套。利用 find 可以根据条件查询数据，类似于关系型数据库的查找。
HBase：宽列数据库。一行中的列数允许动态变化，且列的数目可达数百万。每条记录有唯一的rowkey。支持 scan 模糊查找和 get 精确查找。

## 中间件

## 消息队列
RabbitMQ：通过 virtual host 进行业务隔离。消息是发送到 Exchange 交换机，消息会附带一个 RoutingKey。Exchange 下可以绑定具体的 queue 队列。绑定方式有三种：1. 广播，即绑定到 Exchange 的所有队列都能收到消息；2. 直连，即根据消息的 RoutingKey 将消息发到唯一的一个队列中。3. 订阅，即 RoutingKey 能匹配到的消息队列能接受到消息。队列支持优先级排序。
RocketMQ：阿里开源项目，分布式消息系统
Kafka：大数据系统常用队列，吞吐量很高。
ActiveMQ：基于JMS，Apache项目


## 其他
Alibaba-Dubbo：Java RPC 框架，用于实现服务通信。采用传输层 tcp 协议，占用带宽小。采用 jdk 自带的序列化协议。