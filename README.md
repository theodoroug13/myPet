#  myPet

**myPet** is a  web application designed to bridge the gap between pet owners and veterinarians. It helps managing pet health records, scheduling appointments, and handling pet-related declarations (such as lost/found pets). 

##  Tech Stack

This project is built using modern web technologies to ensure a responsive and intuitive user experience:

* **Frontend Framework:** [React](https://react.dev/)
* [cite_start]**Build Tool:** [Vite](https://vitejs.dev/) [cite: 3]
* **UI Library:** [Material UI (MUI)](https://mui.com/)
* [cite_start]**Mock Backend:** [JSON Server](https://www.npmjs.com/package/json-server) (for local data simulation) [cite: 4]
* [cite_start]**Runtime:** Node.js [cite: 3]

## Key Features

The application is divided into two distinct user roles, each with a tailored dashboard:

### [cite_start] For Pet Owners 
* **Owner Dashboard:** A centralized hub for all pet-related activities.
* **Pet Management:** View lists, details, and digital health books for pets.
* **Appointments:** Book new appointments and view history.
* **My Vet:** Search for veterinarians and view their profiles.
* **Declarations:** Manage various pet declarations.
* **Lost Pets:** View lost pets and report found animals.

### [cite_start] For Veterinarians 
* **Vet Dashboard (Clinic):** Manage clinic operations efficiently.
* **Profile Management:** View and edit professional details.
* **Appointment Management:** List, manage, and confirm upcoming visits.
* **Working Hours:** Configure availability.
* **Pet Records:**
    * Register new pets.
    * Perform medical acts (Services, Drafts, History).
    * Manage incidents (Lost/Found, Foster/Adoption, Transfers).

##  Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites
[cite_start]Make sure you have **Node.js** and **npm** installed on your machine. [cite: 3]

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/theodoroug13/myPet.git](https://github.com/theodoroug13/myPet.git)
    cd myPet
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

### Running the Application

To run the application, you need to start **both** the frontend client and the mock backend server. [cite_start]It is recommended to run these in two separate terminal windows/tabs. [cite: 3, 4]

**1. Start the Mock Backend (JSON Server)**
This serves the local data from `db.json`.
```bash
npm run server
```
**2.Start the Frontend (Vite)**
```bash
npm run dev
```
Go to the localhost URL provided by Vite (usually http://localhost:5173).

**3. Demo Credentials**
Use the following accounts to test the different user roles:
##  Owner

  -  username: owner1

  -  password: 123

## Vet

  -  username: vet1

  -  password: 123

 # Contributors
-  Giorgos Theodorou 


-  Andreas Chatzitofis 


-  Nikolaos Spyrou
