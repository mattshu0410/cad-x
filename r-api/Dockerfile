# Use rocker instead of rstudio/plumber for better ARM64 support
FROM rstudio/plumber

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
    readxl \
    httr \
    remotes

# Install your BioHEARTResilience package from GitHub
# This happens during image build, so it won't reinstall every time the container runs
RUN R -e "remotes::install_github('mattshu0410/BioHEARTResilience', force = TRUE)"

# Install CVrisk package from GitHub
RUN R -e "remotes::install_github('vcastro/CVrisk')"

# Create directory for your API files
RUN mkdir -p /app/data

# Set working directory
WORKDIR /app

# Copy your plumber API file into the container
COPY src/plumber.R /app/plumber.R

EXPOSE 8000
CMD ["/app/plumber.R"]