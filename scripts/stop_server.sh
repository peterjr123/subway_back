echo "stop server"
cd /home/ec2-user/backend/deploy
kill $(ps -ef | grep node | awk '{print $2}')