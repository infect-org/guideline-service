# INFECT Guidelines Service

The service consumes data from the Data Access Layer (DAL) using graphQL and 
provides it as RESTful resource to the client.

This service runs behind a envoy sidecar-proxy which is used to collect trace information . Find the docs at https://www.envoyproxy.io/docs/envoy/latest/

## Docker

**build the container**

```bash
docker build -t guideline-service:v1.0.0 .
```


**run the container**

```bash
docker run --name guideline-service --rm -d -p 1000:100 guideline-service:v1.0.0
```

check if it's running by running the following commands:

```bash
docker ps
```

if you run into problems:

```bash
docker run --name guideline-service --rm -d -p 1000:100 -it guideline-service:v1.0.0 bash
```

the drop into the container using the `docker exec -it guideline-service bash` command




## GCP Container registry

**setup**

If you are working the first time with the registry, you have to make sure 
you can authenticate properly

Add you user to the docker group

```bash
sudo usermod -a -G docker ${USER}
```

Configure docker to use gcloud as authenticator

```bash
gcloud auth configure-docker
```

**publish your container**

Tag your container (more info [here](https://cloud.google.com/container-registry/docs/pushing-and-pulling?hl=en_US&_ga=2.180811239.-1756782310.1554894612&_gac=1.187230938.1562576817.CjwKCAjw04vpBRB3EiwA0IieauC8DNUBSa1Qfuz7KGFp49TCNFkQNB0MveYB65XV4thglDGxncBeMBoC2L0QAvD_BwE)))

```bash
docker tag guideline-service:v1.0.0 eu.gcr.io/infect-app/guideline-service
```


push your container

```bash
docker push eu.gcr.io/infect-app/guideline-service
```




## GCP Instance Template

**setup**

You need to create an instance template using the CLI, since the web UI doesn't work.

```bash
gcloud compute instance-templates create-with-container guideline-service --container-image=eu.gcr.io/infect-app/guideline-service --machine-type=f1-micro --network=default --no-address --tags=http,jaeger-source
```

You can now use this template to create an instance group
