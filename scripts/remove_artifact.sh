echo "remove artifact"
find /home/ec2-user/backend/deploy -maxdepth 1 ! -name 'node_modules' -exec rm -rf {} +