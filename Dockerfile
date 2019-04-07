FROM codercom/code-server:latest

ENV DEBIAN_FRONTEND=noninteractive

USER root

RUN apt-get update

RUN apt-get install -y \
    build-essential \
    curl \
    g++ \
    git \
    graphicsmagick \
    graphicsmagick-imagemagick-compat \
    htop \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    apache2-utils \
    nano \
    ntp \
    tree \
    python \
    python-dev \
    python-pip \
    software-properties-common \
    supervisor \
    tmux \
    trash-cli \
    zip \
    unzip \
    vim \
    wget

RUN cd /tmp && \
    wget https://nodejs.org/dist/v10.15.3/node-v10.15.3-linux-x64.tar.gz && \
    cd /usr/local && \
    tar --strip-components 1 -xzf /tmp/node-v10.15.3-linux-x64.tar.gz && \
    rm /tmp/node-v10.15.3-linux-x64.tar.gz && \
    npm i -g npm@latest

RUN pip install webdiff
RUN pip install git+git://github.com/badele/gitcheck.git
RUN pip install colored

RUN curl -sSL https://get.docker.com/ | sh
RUN usermod -aG staff,docker,root coder
RUN pip install docker-compose
RUN curl -L https://raw.githubusercontent.com/docker/compose/$(docker-compose version --short)/contrib/completion/bash/docker-compose > /etc/bash_completion.d/docker-compose

RUN apt-get install -y -qq groff less && pip install awscli --upgrade --user
RUN apt-get install git

RUN add-apt-repository -y ppa:ondrej/php

RUN apt-get install -y --allow-unauthenticated \
    php7.1-cli \
    php7.1-common \
    php7.1-json \
    php7.1-curl \
    php7.1-xml \
    php7.1-intl \
    php7.1-mcrypt \
    php7.1-bz2 \
    php7.1-opcache \
    php7.1-mbstring \
    php7.1-gmp \
    php7.1-mysqlnd \
    php7.1-xdebug

RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
RUN php composer-setup.php
RUN php -r "unlink('composer-setup.php');"
RUN mv composer.phar /usr/local/bin/composer
RUN chmod +x /usr/local/bin/composer

COPY files/ssh/config /root/.ssh/config
RUN chmod 0600 /root/.ssh/config

RUN apt-get install -y mysql-client

# COPY files/init /opt/init
# RUN chown -R coder:coder /opt/init; chmod +x /opt/init/index

COPY files/supervisor/conf.d/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN npm i -g jake grunt-cli gulp lerna

RUN rm -rf /home/coder/project

COPY files/vscode-local /home/coder/.local
RUN chown -R coder:coder /home/coder/.local

ENTRYPOINT ["dumb-init", "supervisord"]
