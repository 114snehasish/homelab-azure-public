# Verification Guide: Verifying Persistence

This guide explains how I verify that my infrastructure is working correctly, specifically focusing on the most critical part: **Data Persistence**.

Since I follow the "Cattle, Not Pets" philosophy, I must prove that destroying my VM does **not** destroy my data.

---

## 1. The Volume Persistence Test

I use **Volume Persistence**. My persistent disk is mounted to `/data` on the VM.
**Containers are ephemeral** (they disappear on recreation), but **Data is persistent** (safe in `/data`).

### Step 1: Deploy & Setup
1.  I deploy all my modules:
    ```bash
    cd infra/network && terraform apply -auto-approve
    cd ../../infra/storage && terraform apply -auto-approve
    cd ../../compute/vm && terraform apply -auto-approve
    ```
2.  I get the SSH connection command:
    ```bash
    terraform output ssh_command
    # Example: ssh azureuser@20.12.33.44
    ```

### Step 2: Create Persistent Data
1.  I SSH into the VM: `ssh azureuser@<public-ip>`
2.  I verify the mount exists:
    ```bash
    df -h /data
    # Should see my 20GB disk mounted
    ```
3.  I run a test container with **Volume Mapping**:
    ```bash
    # I map the persistent /data directory into the container.
    sudo docker run -d --name test-redis -v /data/redis:/data redis
    
    # I write a file specifically to the persisted volume
    sudo docker exec test-redis sh -c "echo 'Volume Persistence Works' > /data/persistence_check.txt"
    ```

### Step 3: The "Destruction" Test
Back on my local machine, I simulate a disaster or upgrade by destroying the VM:
1.  I destroy ONLY the Compute module:
    ```bash
    cd compute/vm
    terraform destroy -auto-approve
    ```
2.  I verify that the VM is gone, but the Storage module resources still exist.
3.  I recreate the VM:
    ```bash
    terraform apply -auto-approve
    ```

### Step 4: Verify Survival
1.  I SSH into the **new** VM.
2.  I check currently running containers:
    ```bash
    docker ps -a
    # This will be EMPTY. This is correct! New VM = New Docker Engine.
    ```
3.  I start a **new** container mapping to the **same** data:
    ```bash
    sudo docker run -d --name test-redis-2 -v /data/redis:/data redis
    
    # Check if the file from the PREVIOUS container exists:
    sudo docker exec test-redis-2 cat /data/persistence_check.txt
    ```
4.  **Success Condition**: The command outputs `'Volume Persistence Works'`. My data survived the VM destruction!
