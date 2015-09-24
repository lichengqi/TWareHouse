
# 124.200.36.202:8118
# 123.245.172.192:80
# 124.202.171.126:8118
# 114.255.183.163:8080 
# 182.254.153.54:80
# 124.202.180.186:8118
# 211.141.82.247:8118
# 61.156.3.166:80
# 115.182.83.38:8080
# 124.202.169.54:8118
# 查看本题解析需VIP身份或扣除优点

curl --connect-timeout 10 -x $2 -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.61 Safari/537.36" $1 | grep "pt6" > "output/$2.txt"

line=`cat "output/$2.txt" | grep "【解答】" | wc -l`

if [ $line -gt 0  ]; then
	echo $2 >> result;
fi






