#!/bin/bash

# 获取脚本运行目录
DIR=$(dirname $(readlink -f "$0/../"))
POSTS_DIR=$(dirname $(readlink -f "$DIR"))/posts/
echo $POSTS_DIR

# 拉取博文
git -C "$POSTS_DIR" pull origin master
# 生成博文
node "$DIR/src/compile.js" "$POSTS_DIR" "$DIR"
# 推送更新
git -C "$DIR" add *.md
git -C "$DIR" add *.html
git -C "$DIR" add *.js
git -C "$DIR" add *.css
git -C "$DIR" add *.png
git -C "$DIR" add *.ico
git -C "$DIR" add *.sh
git -C "$DIR" commit -m "from compile.sh"
git -C "$DIR" push