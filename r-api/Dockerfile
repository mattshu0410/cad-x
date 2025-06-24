# Start from the official plumber image (has R + plumber pre-installed)
FROM rstudio/plumber

# Add metadata
LABEL org.opencontainers.image.authors="BioHEART Team"
LABEL org.opencontainers.image.description="BioHEART Resilience Calculator API"

# Install system dependencies needed for your package
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libgit2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install additional R packages needed by your API and the BioHEARTResilience package
RUN R -e "install.packages(c('readr', 'readxl', 'dplyr', 'tidyr', 'httr', 'devtools'), repos='https://cloud.r-project.org/')"

# Install your BioHEARTResilience package from GitHub
# This happens during image build, so it won't reinstall every time the container runs
RUN R -e "devtools::install_github('mattshu0410/BioHEARTResilience')"

# Create directory for your API files
RUN mkdir -p /app/data

# Set working directory
WORKDIR /app

# Copy your plumber API file into the container
COPY src/plumber.R /app/plumber.R

# The default command - tells plumber which file to run
# This inherits the ENTRYPOINT from rstudio/plumber which handles plumb() and run()
CMD ["/app/plumber.R"]