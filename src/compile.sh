#!/bin/bash

# 获取脚本运行目录
DIR=$(realpath "$(dirname "$0")/../")
POSTS_DIR="C:\Users\freshman\OneDrive\posts"

# 生成博文
cd $DIR
node "./src/compile.js" "$POSTS_DIR" "$DIR" "v1" "https://lalinking.github.io/"
node "./src/compile.js" "$POSTS_DIR" "$DIR" "v2" "https://lalinking.github.io/"
cd -