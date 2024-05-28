from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.cluster import KMeans, AgglomerativeClustering, DBSCAN
import numpy as np
import io

app = Flask(__name__)
CORS(app)

@app.route('/cluster', methods=['POST'])
def cluster_data():
    try:
        file = request.files['file']
        algorithm = request.form.get('algorithm', 'kmeans')
        n_clusters = int(request.form.get('n_clusters', 3))
        data = pd.read_csv(io.StringIO(file.read().decode('utf-8')))
        
        if algorithm == 'kmeans':
            model = KMeans(n_clusters=n_clusters)
        elif algorithm == 'hierarchical':
            model = AgglomerativeClustering(n_clusters=n_clusters)
        elif algorithm == 'dbscan':
            model = DBSCAN(eps=0.5, min_samples=5)
        else:
            return jsonify({'error': 'Invalid algorithm specified'}), 400
        
        # Select only numeric columns for clustering
        numeric_data = data.select_dtypes(include=[np.number])
        labels = model.fit_predict(numeric_data)
        data['cluster'] = labels.tolist()

        clustered_data = data.to_dict(orient='records')
        return jsonify(clustered_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
