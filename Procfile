# web: sh -c "export PYTHONPATH=$(pwd):$PYTHONPATH && streamlit run extract/dashboard.py --server.port=$PORT --server.enableCORS=true --server.enableXsrfProtection=false"
web: cd nfse-abrasf-streamlit-frontend/aqua-file-transform && npm install && npm run build && npx serve -s dist -l $PORT
