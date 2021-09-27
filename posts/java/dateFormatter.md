-----

Title: “自适应”的 String 转 Date 工具
Date: 2018-11-09
Description: 预先注册可能用到的日期格式，之后可通过传入的字符串特征自动转换成 Date 对象，而不需要另外指定格式。

-----

## 功能

动态地将 String 转换为 Date 对象。

## 使用

```java
// 先注册一些可能用到的日期 DateFormat
DateStrParser.regestDateParser("yyyy-MM-dd");
DateStrParser.regestDateParser("yyyyMMdd");

// 调用 DateFormat，得到 Date 对象
Date date1 = DateStrParser.parseToDate("2018-11-09");
Date date2 = DateStrParser.parseToDate("20181109");

```

## 原理

### 注册 DateFormat

* 根据传入字符串 pattern，生成一个 SimpleDateFormat 放入 一个 Map 中。

* Map 的 key: pattern 中 表示一个数字的 GyYMLwWDdFEuaHkKhmsS 等用于格式化的特殊字母全部替换为 0 后得到的字符串。传入 "yyyy-MM-dd"，则 key 为 "0000-00-00"；传入 "yyyyMMdd" 则 key 为 "00000000".



### 解析字符串

* 先将传入的 dateStr 中所有数字都替换为 0 得到能获取对应 SimpleDateFormat 的 key。传入 "2018-11-09" 得到 "0000-00-00"；传入 "20181109" 得到 "00000000"。

* 根据 key 从 Map 中获取 SimpleDateFormat 进行转化。

## 源码

```java
package com.ricbbs.core;


import lombok.SneakyThrows;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 字符串 => java.util.Date 转换工具类
 */
public final class DateUtil {

    public static String DATE_FORMAT = "yyyy-MM-dd";

    public static String DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

    public static String TIME_FORMAT = "HH:mm:ss";

    /**
     * key: GyYMLwWDdFEuaHkKhmsS 等用于格式化的特殊字母全部替换为 0 <br>
     * 传入实际字符串查找对应转换器的时候需要将实际字符串的数字全替换为0
     */
    private static final Map<String, String> dateFormatMap = new ConcurrentHashMap<>();

    /*
     * 以下为内置的可解析日期 pattern
     */
    static {

        // 年月日
        regestDateParser("yyyy-MM-dd");
        regestDateParser("yyyyMMdd");

        // 时分秒
        regestDateParser("HH:mm:ss");
        regestDateParser("HHmmss");
        regestDateParser("HH:mm:ss.SSS");
        regestDateParser("HHmmssSSS");

        // 完整时间戳
        regestDateParser("yyyy-MM-dd HH:mm:ss");
        regestDateParser("yyyyMMddHHmmss");
        regestDateParser("yyyy-MM-dd HH:mm:ss.SSS");
        regestDateParser("yyyyMMddHHmmssSSS");
        regestDateParser("yyyy-MM-dd'T'HH:mm:ss");

        // 完整时间戳带时区
        regestDateParser("yyyy-MM-dd'T'HH:mm:ssX");
        regestDateParser("yyyy-MM-dd'T'HH:mm:ss.SSSX");
    }

    /**
     * 不可实例化
     */
    private DateUtil() {
    }

    /**
     * 设置一个日期转换器
     *
     * @param pattern 已包含：<br>
     *                yyyy-MM-dd <br>
     *                yyyyMMdd <br>
     *                HH:mm:ss <br>
     *                HHmmss <br>
     *                HH:mm:ss.SSS <br>
     *                HHmmssSSS <br>
     *                yyyy-MM-dd HH:mm:ss <br>
     *                yyyyMMddHHmmss <br>
     *                yyyy-MM-dd HH:mm:ss.SSS <br>
     *                yyyyMMddHHmmssSSS <br>
     *                yyyy-MM-dd'T'HH:mm:ss <br>
     *                yyyy-MM-dd'T'HH:mm:ssX <br>
     *                yyyy-MM-dd'T'HH:mm:ss.SSSX <br>
     * @author Ric
     */
    public static void regestDateParser(String pattern) {
        Assert.hasText(pattern, "pattern can't be null.");
        if (pattern.contains("X")) {
            regestDateParser(pattern, pattern.replace("X", "+00:00"));
            regestDateParser(pattern, pattern.replace("X", "-00:00"));
            regestDateParser(pattern, pattern.replace("X", "'Z'"));
        } else {
            regestDateParser(pattern, pattern);
        }
    }

    /**
     * 转化为字符串日期
     *
     * @param format 格式
     * @param date   日期
     * @return new SimpleDateFormat(format).format(date)
     */
    public static String parse(String format, Date date) {
        if (!StringUtils.hasText(format) || date == null) {
            return "";
        } else {
            return new SimpleDateFormat(format).format(date);
        }
    }

    /**
     * 将日期转化为字符串 YYYY-MM-DD
     *
     * @param date 专辑ReleaseDate
     * @return new SimpleDateFormat(format).format(date)
     */
    public static String parseDate(Date date) {
        return parse(DATE_FORMAT, date);
    }

    /**
     * 将时间化为字符串 YYYY-MM-DD hh:mm:ss
     *
     * @param date 专辑ReleaseDate
     * @return new SimpleDateFormat(format).format(date)
     */
    public static String parseDateTime(Date date) {
        return parse(DATETIME_FORMAT, date);
    }

    /**
     * 将时间化为字符串 HH:mm:ss
     *
     * @param date 专辑ReleaseDate
     * @return new SimpleDateFormat(format).format(date)
     */
    public static String parseTime(Date date) {
        return parse(TIME_FORMAT, date);
    }

    /**
     * 解析字符串
     *
     * @return java.util.Date
     * @author Ric
     */
    @SneakyThrows
    public static Date parseToDate(String dateStr) {
        String key = dateStr.replaceAll("\\d", "0");
        String format = dateFormatMap.get(key);
        Assert.notNull(format, "can't find format for this date string: " + dateStr);
        return new SimpleDateFormat(format).parse(dateStr);
    }

    private static void regestDateParser(String pattern, String example) {
        String[] split = example.split("'");
        boolean s = false;
        StringBuilder key = new StringBuilder();
        for (String string : split) {
            if (s) {
                key.append(string);
            } else {
                key.append(string.replaceAll("[GyYMLwWDdFEuaHkKhmsS]", "0"));
            }
            s = !s;
        }
        dateFormatMap.put(key.toString(), pattern);
    }

}
```
