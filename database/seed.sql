USE portfoliopro;

-- Sample prices, not live quotes. Skip this file if you let the app seed on first start.
INSERT INTO stocks (symbol, company, sector, price, prev_close, pe_ratio, sma_20) VALUES
  ('TCS','Tata Consultancy Services','IT',3920.00,3895.00,29.5,3870.00),
  ('INFY','Infosys','IT',1655.00,1668.00,24.8,1640.00),
  ('WIPRO','Wipro','IT',482.00,479.00,21.2,470.00),
  ('HCLTECH','HCL Technologies','IT',1710.00,1702.00,25.6,1685.00),
  ('HDFCBANK','HDFC Bank','Banking',1725.00,1712.00,18.9,1700.00),
  ('ICICIBANK','ICICI Bank','Banking',1258.00,1265.00,17.4,1240.00),
  ('SBIN','State Bank of India','Banking',815.00,809.00,10.8,800.00),
  ('KOTAKBANK','Kotak Mahindra Bank','Banking',1790.00,1798.00,19.6,1775.00),
  ('RELIANCE','Reliance Industries','Energy',1405.00,1396.00,27.3,1390.00),
  ('ONGC','Oil and Natural Gas Corp','Energy',248.00,251.00,7.9,245.00),
  ('NTPC','NTPC','Energy',342.00,339.00,16.1,335.00),
  ('SUNPHARMA','Sun Pharmaceutical','Pharma',1715.00,1704.00,35.2,1690.00),
  ('DRREDDY','Dr. Reddy's Laboratories','Pharma',1262.00,1270.00,19.8,1250.00),
  ('CIPLA','Cipla','Pharma',1548.00,1541.00,26.4,1530.00),
  ('ITC','ITC','FMCG',421.00,423.00,26.9,415.00),
  ('HINDUNILVR','Hindustan Unilever','FMCG',2452.00,2447.00,52.3,2430.00)
ON DUPLICATE KEY UPDATE price = VALUES(price);
