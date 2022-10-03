[TOC]

# 各种概念、工具名词解释（持续更新）

一个个去学吧

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
MySQL/MariaDB：开源免费。被Sun收购后，Sun又被Oracle收购
SQL Server：微软的，只能在 windows server使用
PostgrcSQL：没用过
DB2：IBM的，与Oracle竞争

### 非关系型
Redis：Key-Value数据库。数据存储在内存中，读写性能很高，可以刷到磁盘永久存储。单线程单进程，多路IO复用。
Memcached：Key-Value数据库。数据存储在内存中。
MongoDB：文档数据库。无固定结构，不同的记录允许有不同的列数和列类型。列允许包含多值，记录允许嵌套。利用 find 可以根据条件查询数据，类似于关系型数据库的查找。
HBase：宽列数据库。一行中的列数允许动态变化，且列的数目可达数百万。每条记录有唯一的rowkey。支持 scan 模糊查找和 get 精确查找。

## 中间件

### 消息队列
RabbitMQ：通过 virtual host 进行业务隔离。队列支持优先级排序。
  消息是发送到 Exchange 交换机，消息会附带一个 RoutingKey。
  Exchange 下可以绑定具体的 queue 队列。绑定方式有三种：
   1. 广播，即绑定到 Exchange 的所有队列都能收到消息；
   2. 直连，即根据消息的 RoutingKey 将消息发到唯一的一个队列中。
   3. 订阅，即 RoutingKey 能匹配到的消息队列能接受到消息。
RocketMQ：阿里开源项目，分布式消息系统
Kafka：大数据系统常用队列，吞吐量很高。
ActiveMQ：基于JMS，Apache项目

### 搜索引擎
Solr：基于Lucene。专注文本搜索。使用ZooKeeper实现分布式部署。与同事讨论得知，Solr在搜索命中大量结果时响应速度会变慢（我没有solr环境未做验证）
Elasticsearch：基于Lucene。提供RESTful API。内置Zen组件实现分布式。

## 其他中间件
Alibaba-Dubbo：Java RPC 框架，用于实现服务通信。采用传输层 tcp 协议，占用带宽小。采用 jdk 自带的序列化协议。
ZooKeeper：分布式应用协调服务。可以提供以下服务：
  1. Name Service 命名服务，通过调用create node api注册一个path全局唯一的node。
  2. 数据发布与订阅，将数据发布到节点上订阅者动态获取数据，实现配置管理。
  3. 分布通知/协调，watcher注册与异步通知机制。
  4. 分布式锁，zk保证数据在集群中的强一致性。可以通过创建节点来实现分布式锁，所有客户端都去创建 /distribute_lock 节点，最终成功创建的那个客户端也即拥有了这把锁。
  5. 集群管理，zk可以创建EPHEMERAL类型的节点，一旦客户端和服务器的会话结束或过期，那么该节点就会消失。因此可以通过EPHEMERAL节点和watcher机制实现集群管理。

## 好用的工具
Lombok：通过注解自动生成 hashCode() 和 equals() 、getter / setter。看了下源码，是通过继承AbstractProcessor在编译期修改了修饰类的代码。公司规范只允许使用在POJO上，实际上还有很多好用的注解如：@Synchronized、@SneakyThrows、@Cleanup。
MyBatis-Plus：mybatis的一个增强工具，自动添加单表大部分 CRUD 操作。公司规范不允许使用，尤其是mysql分页查询、多表查询禁止使用动态sql。这个工具是使用mybatis Interceptor实现的。
    因功能太多太重公司项目未引入，所以我做了一个类似的但是轻量级的工具，里面只有三个类可以不引入直接拷贝类到项目里。解决烦人的单表操作，顺便提供了一个快速配置数据源的注解：https://gitee.com/somestring/mycurd-springboot-starter

未完待续