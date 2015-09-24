
len=`cat url | wc -l`
while [ $len -gt 250 ]; do
    count=1
    len=`cat url | wc -l`
    len=$((len-250))
    ip=""
    while [ $count -lt $len ]; do
        echo $count
        ip=`curl --connect-timeout 10 -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.61 Safari/537.36" "http://www.kuaidaili.com/api/getproxy/?orderid=993794647276065&num=250&browser=1&protocol=1&method=1&quality=1&sort=0&format=text&sep=3"`
        echo $ip
        echo $((count+249))
        awk 'NR=='$count',NR=='$((count+249))'{print $0}' url > temp
        j=1
        for i in $ip; do
            url=`awk 'NR=='$j'{print $0}' temp`
            filename=`awk 'BEGIN {len=split("'$url'", files, "/");print files[len];}'`
            folder=`awk 'BEGIN {len=split("'$url'", files, "/");print files[len-3];}'`
            sh single_answer.sh $url $i $filename $folder &
            count=$((count+1))
            j=$((j+1))
        done
        echo "start sleep"
        sleep 5
        echo "end sleep"
    done
    
    cd checker
    sh run.sh
    cd ..
    len=`cat url | wc -l`
done



