  Step 2: Create DigitalOcean Droplet

  1. Log into DigitalOcean and create a new Droplet:
    - Choose Docker from the Marketplace (pre-configured with Docker)
    - Select droplet size: Basic Plan - $6/month (1GB RAM, 1 vCPU) should be sufficient for the R API
    - Choose region closest to your users
    - Add SSH key for secure access

  Step 3: Build and Push Docker Image

  On your local machine:

  # Navigate to your r-api directory
  cd r-api

  # Build the Docker image
  docker build -t bioheart-r-api .

  # Tag the image for transfer
  docker tag bioheart-r-api bioheart-r-api:latest

  # Save the image to a tar file
  docker save bioheart-r-api:latest > bioheart-r-api.tar

  Step 4: Transfer Image to DigitalOcean

  # Replace YOUR_DROPLET_IP with your actual droplet IP
  scp bioheart-r-api.tar root@YOUR_DROPLET_IP:/tmp/

  # SSH into your droplet
  ssh root@YOUR_DROPLET_IP

  # Load the Docker image
  docker load < /tmp/bioheart-r-api.tar

  # Clean up the tar file
  rm /tmp/bioheart-r-api.tar

  Step 5: Configure Firewall

  On your DigitalOcean droplet:

  # Allow HTTP traffic on port 8000 (default plumber port)
  ufw allow 8000

  # Check firewall status
  ufw status

  Step 6: Deploy the R API

  # Run the container
  docker run -d \
    --name bioheart-api \
    --restart unless-stopped \
    -p 8000:8000 \
    bioheart-r-api:latest

  # Check if it's running
  docker ps

  # View logs
  docker logs bioheart-api

  Step 7: Test the API

  # Test the API endpoint
  curl http://YOUR_DROPLET_IP:8000/api/analyse

  # Or from your local machine
  curl http://YOUR_DROPLET_IP:8000/api/analyse

  Step 8: Update Frontend Configuration

  Update your Next.js environment variable:

  # In your local project root
  echo "NEXT_PUBLIC_R_API_URL=http://YOUR_DROPLET_IP:8000" >> .env.local

  Optional: Set up Domain and SSL

  For production use:

  1. Point a domain to your droplet IP
  2. Install Nginx as reverse proxy
  3. Get SSL certificate with Let's Encrypt
  4. Configure Nginx to proxy requests to your Docker container

  The basic deployment should now be working. Your R API will be accessible at http://YOUR_DROPLET_IP:8000/api/analyse.


  Make sure you place the .tar file in a snap-accessible location ~/
  docker stop $(docker ps -q)
  docker system prune -a
  docker load -i ~/bioheart-r-api.tar
  

  