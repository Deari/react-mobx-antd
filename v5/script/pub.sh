if [ -n "$1" ]
then
cd asset-dev && fsk-sync -d ./ -r /data/static/$1/fe-bzad-pc -h 10.110.15.1 -p qa -u qa --localroot asset-dev --pub
else
  echo "无QA环境"
fi