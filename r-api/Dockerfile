# Use rocker instead of rstudio/plumber for better ARM64 support
FROM rocker/r-ver:4.3.2

# Add metadata
LABEL org.opencontainers.image.authors="BioHEART"
LABEL org.opencontainers.image.description="CAD-X"

# Install system dependencies needed for your package
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libgit2-dev \
    && rm -rf /var/lib/apt/lists/*

# Use install2.r for faster installation with RStudio Package Manager
RUN install2.r --error \
    plumber \
    readr \
    readxl \
    dplyr \
    tidyr \
    httr \
    devtools

# Install your BioHEARTResilience package from GitHub
# This happens during image build, so it won't reinstall every time the container runs
RUN R -e "devtools::install_github('mattshu0410/BioHEARTResilience')"

# Install CVrisk package from GitHub
RUN R -e "devtools::install_github('pzhaonet/CVrisk')"

# Create directory for your API files
RUN mkdir -p /app/data

# Set working directory
WORKDIR /app

# Copy your plumber API file into the container
COPY src/plumber.R /app/plumber.R

EXPOSE 8000
CMD ["R", "-e", "plumber::plumb('/app/plumber.R')$run(host='0.0.0.0', port=8000)"]