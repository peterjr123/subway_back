echo "stop server"
cd /home/ec2-user/deploy
kill $(ps -ef | grep node | awk '{print $2}')