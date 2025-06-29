This is documentation to ensure I remember and understand how my back-end works.

DNS subdomain resilience.matthewshu.me points towards server IP of DigitalOcean droplet. Nginx HTTP block (port 80) catches requests that are http:// and redirects to https:// to ensure all traffic is secure. Nginx HTTPS block (port 443) receives encrypted request and uses Let's Encrypt SSL cert to decrypt traffic. Nginx reverse proxy then forwards request as plain HTTP to localhost with all the original headers preserved. Docker container running R Plumber API receives request and CORS filter checks if request allowed. R Plumber API returns JSON response to Nginx which encrypts response with SSL cert and send HTTPS response back to user.

The other thing to note is that often AI will produce code that has serious security flaws like exposing your the IP and port of your Docker Container for instance such that irrespective of CORS policies you have set within an individal API file, one can still make curl requests since CORS only protects against browser-based cross origin requests. You can imagine that if you had commit history and a public repo, one could inspect your .env that you accidentally pushed or what you've written in your personal documentation and use that to gain access - bypassing nginx entirely. So some things important to check are

1. Make sure Docker only binds to localhost `sudo ss -tlnp | grep :8000`
2. Make sure Firewalls do not allow direct port access `sudo ufw status numbered`
3. This request for instance should time out `http://134.199.153.33:8000/health`



```mermaid
graph TD
    A[User Browser or Client] -->|"1\. HTTP Request to resilience.matthewshu.me"| B[DNS Resolution]
    B -->|"2\. Resolves to 134.199.153.33"| C[DigitalOcean Server]
    
    C -->|"3\. Nginx receives HTTP on port 80"| D{Nginx HTTP Block}
    D -->|"4\. 301 Redirect to HTTPS"| E[HTTPS Redirect Response]
    E -->|"5\. Browser follows redirect automatically"| F[New HTTPS Request]
    
    F -->|"6\. HTTPS Request to resilience.matthewshu.me"| G[Nginx HTTPS Block Port 443]
    
    G -->|"7\. SSL Termination and Decryption"| H[Nginx Reverse Proxy]
    
    H -->|"8\. HTTP Forward to localhost:8000"| I[Docker Container bioheart-r-api]
    
    I -->|"9\. R Plumber API Processes request"| J[API Response JSON data]
    
    J -->|"10\. HTTP Response back to Nginx"| H
    H -->|"11\. SSL Encryption of response"| G
    G -->|"12\. HTTPS Response with Secure JSON"| A
    
    subgraph "DigitalOcean Server"
        subgraph "Nginx Configuration"
            D
            G
            H
        end
        
        subgraph "Docker Environment"
            I
            J
        end
        
        subgraph "Let's Encrypt SSL"
            K[SSL Certificate at /etc/letsencrypt/live/]
            L[Private Key fullchain.pem and privkey.pem]
        end
    end
    
    subgraph "External Services"
        M[Let's Encrypt CA Certificate Authority]
        N[Namecheap DNS Domain Registrar]
        O[Certbot Auto-Renewal Runs twice daily]
    end
    
    G -.->|"Uses SSL certs"| K
    G -.->|"Uses private key"| L
    M -.->|"Issues and renews certificates"| K
    N -.->|"DNS A Record resilience maps to 134.199.153.33"| B
    O -.->|"Automatic renewal every 90 days"| K
    
    style A fill:#e1f5fe
    style I fill:#f3e5f5
    style G fill:#e8f5e8
    style K fill:#fff3e0
    style M fill:#fce4ec
```