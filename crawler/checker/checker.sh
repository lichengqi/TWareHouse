
filename=$1
subject=$2
line=`grep "【解答】" ../$subject/$filename | wc -l`
if [ $line -gt 0 ]; then
	echo "http://www.jyeoo.com/$subject/ques/detail/$filename" >> available
	mv ../$subject/$filename ../${subject}_output/
fi


