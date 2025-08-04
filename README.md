# DummyJSON k6 Performance Test Project



## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [How to Run Tests](#how-to-run-tests)
  - [Running All Tests](#running-all-tests)
  - [Running Individual Tests](#running-individual-tests)
- [Viewing Reports in Grafana](#viewing-reports-in-grafana)
- [Contributing](#contributing)
- [License](#license)

## About the Project

This project provides a comprehensive performance testing suite for the [DummyJSON API](https://dummyjson.com/) using k6. It is designed to simulate various user interactions with the API, collect performance metrics, and visualize them through Grafana dashboards.

The primary objective is to ensure the DummyJSON API can handle expected loads and to identify potential performance bottlenecks under different scenarios. The project is configured to be easily runnable using Docker Compose, providing a self-contained environment for testing, data storage (InfluxDB), and visualization (Grafana).

## Features

-   **Diverse Test Scenarios:** Includes tests for searching products, selecting specific fields, sorting, listing categories, adding products, and updating products.
-   **Performance Metrics Collection:** Gathers key performance indicators such as request duration, success/failure rates, and custom metrics.
-   **Dockerized Environment:** All components (k6, InfluxDB, Grafana) run within Docker containers for easy setup and consistent execution.
-   **Grafana Integration:** Automatically sends test results to InfluxDB, which is then visualized in pre-configured Grafana dashboards.
-   **Pure JavaScript Tests:** Test scripts are written in pure JavaScript, following k6's native execution model.
-   **Detailed Logging:** Each test script logs the HTTP status code on success and the status code along with the response body on failure for quick debugging.

## Technologies Used

-   **k6:** A powerful open-source load testing tool that treats infrastructure as code.
-   **Docker:** Containerization platform for packaging and running applications.
-   **Docker Compose:** Tool for defining and running multi-container Docker applications.
-   **InfluxDB:** A time-series database used to store k6 performance metrics.
-   **Grafana:** An open-source platform for monitoring and observability, used for visualizing k6 test results.
-   **JavaScript:** The programming language used for writing k6 test scripts.

## Project Structure

```
.dummyjson-k6-performance-test/
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── k6-tests/
│   ├── get-categories-details.js
│   ├── get-category-names.js
│   ├── get-products-by-category.js
│   ├── get-products-select-fields.js
│   ├── get-products-sort-asc.js
│   ├── get-products-sort-desc.js
│   ├── get-search-products.js
│   ├── post-add-product.js
│   ├── put-update-product.js
│   └── search-products.js
├── grafana/
│   └── provisioning/
│       ├── dashboards/
│       │   └── dashboard.yml
│       └── datasources/
│           └── datasource.yml
├── package.json
├── package-lock.json
└── README.md
```

-   **`k6-tests/`**: Contains all the k6 JavaScript test scripts.
-   **`docker-compose.yml`**: Defines the multi-container Docker application (k6, InfluxDB, Grafana).
-   **`Dockerfile`**: Specifies how the k6 Docker image is built.
-   **`grafana/provisioning/`**: Contains configuration files for Grafana to automatically set up data sources and dashboards.
-   **`package.json`**: Manages project dependencies and scripts.
-   **`README.md`**: This documentation file.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following software installed on your system:

-   **Git:** For cloning the repository.
-   **Docker Desktop:** Includes Docker Engine and Docker Compose.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/thitoribeiro/dummyjson-k6-performance-test.git
    cd dummyjson-k6-performance-test
    ```

2.  **Build the Docker images:**
    ```bash
    docker-compose build
    ```
    This will build the k6 service image based on the `Dockerfile`.

3.  **Start the InfluxDB and Grafana services:**
    ```bash
    docker-compose up -d influxdb grafana
    ```
    This will start the database and visualization tools in the background.

## How to Run Tests

Tests can be executed using `npm run` commands for convenience, which internally leverage `docker-compose run`.

### Running All Tests

To run all performance tests sequentially, use the following command:

```bash
npm run run:all-tests
```

This script will automatically start InfluxDB and Grafana, run all tests, and then stop the services.

### Running Individual Tests

To run a specific test script, use the `run:test` command followed by the test file name (without the `.js` extension).

Example for `search-products.js`:

```bash
npm run run:test search-products
```

**Common Environment Variables (passed with `--env`):**

-   `RATE`: The rate of iterations per `TIME_UNIT`.
-   `TIME_UNIT`: The unit of time for the rate (e.g., `1s`, `1m`).
-   `DURATION`: The total duration of the test run.
-   `PRE_ALLOCATED_VUS`: The initial number of Virtual Users (VUs) to pre-allocate.
-   `MAX_VUS`: The maximum number of VUs that k6 can scale up to.
-   `BASE_URL`: The base URL of the API being tested (defaults to `https://dummyjson.com`).
-   `AUTHORIZATION`: (Optional) Authorization header value if required by the API.

## Viewing Reports in Grafana

Once tests have been executed, the metrics are sent to InfluxDB and can be visualized in Grafana.

1.  **Access Grafana:** Open your web browser and navigate to `http://localhost:3000`.
2.  **Login:** Use the default credentials:
    -   Username: `admin`
    -   Password: `admin`
3.  **Explore Dashboards:** Grafana is pre-configured with a data source pointing to InfluxDB and a default k6 dashboard. You should see your test results appearing in real-time or after the tests complete.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new test scenarios, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add new feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## License

This project is licensed under the ISC License - see the `LICENSE` file for details (if you have one, otherwise specify your chosen license).