## 功能

RestTemplate 发起请求前，打印请求消息体；收到应答时，打印返回内容。并且不影响后续程序的读取和解析。
某些请求不打印日志，避免泄露机密信息。
这里认为 RestTemplate 只用来做 http api 交互，即请求体和响应体都是文本。

## 使用

SpringBoot 注入配置 Bean 即可。

## 原理

RestTemplate 有拦截器机制，利用拦截器机制可打印请求的发送和应答内容。
其中应答内容需要从流中读取，但这样会影响后续代码的读取和解析（流读取过一次以后就没了）。因此对响应流进行封装，重写读取方法，这样在流真正被读取内容时同步得获取到响应内容。

## 源码

```java
    @Bean
    public RestTemplate getRestTemplate() {
        final RestTemplate restTemplate = new RestTemplate();
        // 设置一个拦截器打印前后请求日志
        restTemplate.setInterceptors(Collections.singletonList((request, body, execution) -> {
            // 内部的一个标志，这样的请求不要打印内容，否则泄露密码
            boolean trace = !"NO".equals(request.getHeaders().getFirst("Trace"));
            log.info("Rest Start\n  Url: {}\n  Body: {}", request.getURI().toURL(), trace ? new String(body, StandardCharsets.UTF_8) : "****");
            final long before = System.currentTimeMillis();
            ClientHttpResponse response = execution.execute(request, body);
            if (!trace) {
                log.info("Rest Done\n  Use time: {}\n  Response: ****", System.currentTimeMillis() - before);
                return response;
            }
            // 封装一个对象，以便能在不影响后续处理的情况下打印返回结果
            return new ClientHttpResponse() {
                final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

                @Override
                public HttpHeaders getHeaders() {
                    return response.getHeaders();
                }

                @Override
                public InputStream getBody() throws IOException {
                    // 封装一个流，监听读取事件
                    final InputStream bodyInputStream = response.getBody();
                    return new InputStream() {
                        @Override
                        public int read() throws IOException {
                            final int read = bodyInputStream.read();
                            if (read != -1) {
                                outputStream.write(read);
                            }
                            return read;
                        }

                        @Override
                        public long skip(long n) throws IOException {
                            return bodyInputStream.skip(n);
                        }

                        @Override
                        public int available() throws IOException {
                            return bodyInputStream.available();
                        }

                        @Override
                        public void close() throws IOException {
                            bodyInputStream.close();
                            outputStream.close();
                            // 文件读取结束了，打印读到的内容
                            log.info("Rest Done\n  Use time: {}\n  Response: {}", System.currentTimeMillis() - before, outputStream.toString("utf-8"));
                        }

                        @Override
                        public synchronized void mark(int readlimit) {
                            bodyInputStream.mark(readlimit);
                        }

                        @Override
                        public synchronized void reset() throws IOException {
                            bodyInputStream.reset();
                        }

                        @Override
                        public boolean markSupported() {
                            return bodyInputStream.markSupported();
                        }
                    };
                }

                @Override
                public HttpStatus getStatusCode() throws IOException {
                    return response.getStatusCode();
                }

                @Override
                public int getRawStatusCode() throws IOException {
                    return response.getRawStatusCode();
                }

                @Override
                public String getStatusText() throws IOException {
                    return response.getStatusText();
                }

                @Override
                public void close() {
                    response.close();
                }
            };
        }));
        return restTemplate;
    }
```
