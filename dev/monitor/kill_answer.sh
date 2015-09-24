ps aux | grep answer | awk -F" " '{print $2}' | xargs -i kill {}
