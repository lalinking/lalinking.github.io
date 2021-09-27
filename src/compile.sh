#!/bin/bash

# 获取脚本运行目录
DIR=$(dirname $(readlink -f $0))
POSTS_DIR="$DIR/posts/"
# 拉取博文
git -C "$POSTS_DIR" pull origin master
# 生成博文
node "$DIR/compile.js" "$POSTS_DIR" "$DIR"