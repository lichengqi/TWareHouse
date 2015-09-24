ps aux | grep curl | awk -F" " '{print $2}' | xargs -i kill {}
