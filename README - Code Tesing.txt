# API Testing Guide
Follow the steps below to test the `POST`, `GET`, and `DELETE` methods after starting the server.

POST method
	Copy and paste the following command into CMD after starting the server:
		curl -X POST http://localhost:3000/api/recipes -H "Content-Type: application/json" -d "{\"name\":\"Strawberry Pie\",\"ingredients\":[\"strawberries\",\"sugar\",\"flour\"],\"instructions\":[\"Mix ingredients\",\"Bake for 30 minutes\"]}"

GET method
	Open the following link in your browser:
		http://localhost:3000/api/recipes

UPDATE method
	Copy and paste the following command into CMD after starting the server:
		curl -X PUT http://localhost:3000/api/recipes/3 -H "Content-Type: application/json" -d "{\"name\":\"Updated Strawberry Pie\",\"ingredients\":[\"strawberries\",\"sugar\",\"flour\"],\"instructions\":[\"Mix ingredients\",\"Bake for 45 minutes\"]}"


DELETE method
	Copy and paste the code below to CMD after the server is started
		curl -X DELETE http://localhost:3000/api/recipes/2
