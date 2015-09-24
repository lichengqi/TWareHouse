

curl -x $2 --connect-timeout 10 -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.61 Safari/537.36" $1 | grep -a "pt6" > $4/$3 2>curl.log;



