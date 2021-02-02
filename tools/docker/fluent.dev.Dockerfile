FROM fluent/fluentd:v1.11-debian-1

USER root

RUN buildDeps="sudo make gcc g++ libc-dev ruby-dev" \
&& apt-get update \
&& apt-get install -y --no-install-recommends $buildDeps \
&& sudo gem install \
      fluent-plugin-google-cloud \
&& sudo gem install \
      fluent-plugin-stdout-pp \
&& sudo gem sources --clear-all \
&& SUDO_FORCE_REMOVE=yes \
  apt-get purge -y --auto-remove \
                -o APT::AutoRemove::RecommendsImportant=false \
                $buildDeps \
&& rm -rf /var/lib/apt/lists/* \
&& rm -rf /tmp/* /var/tmp/* /usr/lib/ruby/gems/*/cache/*.gem

COPY apps-extra/fluent/fluent.dev.conf /fluentd/etc/fluent.conf

USER fluent

