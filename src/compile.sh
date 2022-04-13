#!/bin/bash

# 获取脚本运行目录
DIR=$(dirname $(readlink -f "$0/../"))
POSTS_DIR=$(dirname $(readlink -f "$DIR"))/posts/
echo $POSTS_DIR

# 拉取博文
git -C "$POSTS_DIR" pull origin master
cd $DIR
# 设置代理
#git config http.proxy http://127.0.0.1:10809
#git config https.proxy https://127.0.0.1:10809

# 代码保持最新
git pull origin master
# 生成博文
node "./src/compile.js" "$POSTS_DIR" "$DIR" "v1"
# 推送更新
git add *
git add .posts/
git add 3rd-lib/
git add page/
git add resource/
git add src/
git commit -m "from compile.sh"
git push
