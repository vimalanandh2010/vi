@echo off
echo --- DIR --- > env_output.txt
dir >> env_output.txt
echo --- NODE VERSION --- >> env_output.txt
node -v >> env_output.txt
echo --- NETSTAT 5000 --- >> env_output.txt
netstat -ano | findstr :5000 >> env_output.txt
echo --- TASKLIST NODE --- >> env_output.txt
tasklist /FI "IMAGENAME eq node.exe" >> env_output.txt
echo --- ENV DONE --- >> env_output.txt
