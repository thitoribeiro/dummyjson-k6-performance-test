FROM grafana/k6

COPY ./dist /scripts

ENTRYPOINT ["k6"]
