### 功能说明

最近在玩一个游戏，名字叫 《枪手：丧尸幸存者》。这是一款单机游戏，我玩了一段时间发现有个 bug：可以通过调整系统时间，将当前日期 +1 就能领取里面的签到奖励。所以我动起了作弊的心思。
大概流程是这样：
1. 通过自己的实操，获得应用包名、获得点击位置等。
2. 打开系统设置，设置一下系统时间，当前日期 +1。这个也需要模拟触摸和滑动操作。（需要逻辑控制一下，日期增加了30次以后就要开始加月份，月份加了12次以后就要加年份）
3. 关掉系统设置，打开游戏，然后各种模拟点击。得到游戏币以后关掉游戏应用。
4. 用循环控制，一直重复上面的操作，这样就能无限白嫖。
王者荣耀刷金币的脚本也是一样原理。
手机开启 adb，以及 adb connect 的过程略。建议用 wifi 调试，不用数据线，这样不影响手机充电。
adb 最好从谷歌官方下载安装。

### 代码

关键代码

```cmd
# 自己真机操作之前，清除手机运行日志，方便看用到的日志
adb logcat -c
# 自己真机操作完之后，查看操作过程中产生的日志，从中获取到 游戏应用包名、获得点击位置等。
adb logcat
# 打开游戏 后面的参数是从日志中分析获得的
adb shell am start -ncom.parthenon.gunslinger/.UnityPlayerActivity
# 关掉游戏
adb shell am force-stop com.parthenon.gunslinger
# 休眠，每一个操作之后都需要休眠控制操作间隙
timeout /t 1 /nobreak > nul
```

全部代码如下

```cmd
@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

rem 启动游戏并领取奖励
SET v_times=0
rem 设置 date
SET t_date=0
rem 设置 月
SET t_month=0

for /l %%i in (1,1,100) do (
	cls
	echo times %%i
	call :fun_setTime 0
	call :fun_getMony 10
)

:fun_getMony
	for /l %%i in (1,1,%1) do (
		echo 第 %%i 次领取
		rem 启动应用，这个包名通过日志获取。先自己打开游戏，然后在 adb 控制台查看一下运行日志就能找到
		adb shell am start -ncom.parthenon.gunslinger/.UnityPlayerActivity
		timeout /t 13 /nobreak > nul
		rem 点击继续
		adb shell input tap 1000 850
		rem 点击礼包
		timeout /t 2 /nobreak > nul
		adb shell input tap 1180 520
		rem 点击领取
		timeout /t 1 /nobreak > nul
		adb shell input tap 930 760
		rem 关闭应用
		timeout /t 1 /nobreak > nul
		adb shell am force-stop com.parthenon.gunslinger
)
goto:eof


:fun_setTime
	echo 设置时间
	timeout /t 3 /nobreak > nul
	rem tap=0 切换日期
	rem tap=1 切换月份
	rem tap=2 切换年
	SET tap=0
	SET /a t_date+=1
    if %t_date% equ 30 (
		SET tap=1
		SET t_date=0
		SET /a t_month+=1
    )
	if %t_month% equ 12 (
		SET tap=2
		SET t_date=0
		SET t_month=0
	)
	rem 打开设置
	adb shell am start -ncom.android.settings/com.vivo.settings.VivoSubSettings
	timeout /t 1 /nobreak > nul
	rem 滑动到最后
	adb shell input swipe 500 2000 500 500
	timeout /t 1 /nobreak > nul
	rem 点击进入系统设置
	adb shell input tap 500 2000
	timeout /t 1 /nobreak > nul
	rem 点击进入时间/日期设置
	adb shell input tap 500 950
	timeout /t 1 /nobreak > nul
	rem 点击设置日期
	adb shell input tap 500 850
	timeout /t 1 /nobreak > nul
	if %tap% equ 0 (
		rem 设置日期
		echo 设置日期：设置天数
		adb shell input swipe 900 1700 900 1600
	)
	if %tap% equ 1 (
		rem 设置月份
		echo 设置日期：设置月份
		adb shell input swipe 600 1700 600 1600
	)
	if %tap% equ 2 (
		rem 设置年
		echo 设置日期：设置年
		adb shell input swipe 300 1700 300 1600
	)
	timeout /t 1 /nobreak > nul
	rem 点击确认
	adb shell input tap 750 2100
	timeout /t 1 /nobreak > nul
	rem 退出设置程序
	adb shell am force-stop com.android.settings
goto:eof
```