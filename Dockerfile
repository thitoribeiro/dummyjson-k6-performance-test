FROM grafana/k6

COPY ./k6-tests /scripts

ENTRYPOINT ["k6"]
