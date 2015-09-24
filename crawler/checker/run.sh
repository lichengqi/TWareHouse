

subjects="physics2 chemistry2 bio2 math physics bio geography"
for subject in $subjects; do
    ls ../$subject > filename
    awk '{
        system("sh checker.sh "$0" '$subject'")
    }' filename
done

awk 'ARGIND==1{a[$1]=1}ARGIND==2{if(!($1 in a)){print $0}}' available ../url > remain
wc -l available
mv remain ../url
rm filename
rm available

for subject in $subjects; do
    rm -r ../$subject
    mkdir ../$subject
done


