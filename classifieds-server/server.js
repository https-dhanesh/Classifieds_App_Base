require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.get('/listings', async (req, res) => {
  const { data, error } = await supabase.from('listings').select('*');
  if (error) return res.status(500).json(error);
  res.json(data);
});

app.post('/listings', async (req, res) => {
  const { owner_id, title, description, price, latitude, longitude } = req.body;
  const { data, error } = await supabase
    .from('listings')
    .insert([{ owner_id, title, description, price, latitude, longitude }])
    .select();
  if (error) {
    console.log(error);
    return res.status(500).json(error);
  }
  res.json(data);
});

app.post('/listings/:id/view', async (req, res) => {
  const { id } = req.params;

  const { data: item } = await supabase.from('listings').select('views_count').eq('id', id).single();

  const newCount = (item.views_count || 0) + 1;

  const { error } = await supabase.from('listings').update({ views_count: newCount }).eq('id', id);
  
  if (error) return res.status(500).json(error);
  res.json({ success: true, views: newCount });
});

cron.schedule('0 8 * * *', async () => {
  console.log('Generating Daily Report...');
  
  try {
    const { data: listings } = await supabase.from('listings').select('title, views_count, price').order('views_count', { ascending: false });
    
    if (!listings || listings.length === 0) return;

    const totalAds = listings.length;
    const totalViews = listings.reduce((sum, item) => sum + (item.views_count || 0), 0);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Daily Classifieds Summary',
      text: `
        Hello Admin!
        
        Here is the status of the platform:
        -----------------------------------
        Total Active Ads: ${totalAds}
        Total User Views: ${totalViews}
        
        Top Ad: ${listings[0]?.title || 'N/A'}
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Daily report sent!');
  } catch (err) {
    console.error('Email failed:', err);
  }
});

app.get('/search', async (req, res) => {
  const { q } = req.query;
  
  if (!q) return res.json([]); 

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  
  if (error) return res.status(500).json(error);
  res.json(data);
});

app.get('/my-listings/:ownerId', async (req, res) => {
  const { ownerId } = req.params;
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('owner_id', ownerId); 
  
  if (error) return res.status(500).json(error);
  res.json(data);
});

app.get('/suggestions', async (req, res) => {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('views_count', { ascending: false })
    .limit(5);
  
  if (error) return res.status(500).json(error);
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});