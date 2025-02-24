from google.cloud import aiplatform

def predict(instance_dict):
    # initialize the AI platform client
    aiplatform.init(project='basic-formula-451520-c0', location='us-central1')

    # send the query to the model
    endpoint = aiplatform.Endpoint(model='finbert')
    response = endpoint.predict(instances=[instance_dict])

    return response.predictions

# Import and initialize Vertex AI
from google.cloud import aiplatform
aiplatform.init(project="basic-formula-451520-c0", location="us-central1")

# Define your endpoint
endpoint_name="projects/basic-formula-451520-c0/locations/us-central1/endpoints/8056369086831001600"
endpoint = aiplatform.Endpoint(endpoint_name)

# Create a list with a dictionary of inputs
instances = [
    {
        "inputs": "feeling bullish about apple. what's my stock sentiment towards apple rn?",
        "parameters": {
            "max_new_tokens": 128,
            "temperature": 1.0,
        },
    },
]

# Call predict method on endpoint and pass input data
response = endpoint.predict(instances=instances)

# Print results
for prediction in response.predictions:
    print(prediction)