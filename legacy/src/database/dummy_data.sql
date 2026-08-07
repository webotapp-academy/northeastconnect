-- Dummy Data for Discover Assam Database

-- Searches Table
INSERT INTO searches (search_term, search_category, search_location, search_count) VALUES
('Kaziranga', 'Wildlife', 'Golaghat', 45),
('Bihu Festival', 'Culture', 'Guwahati', 78),
('Tea Gardens', 'Tourism', 'Jorhat', 62),
('Majuli Island', 'Culture', 'Majuli', 53),
('Software Jobs', 'Jobs', 'Guwahati', 37),
('River Rafting', 'Adventure', 'Dibru-Saikhowa', 29),
('Assam Tourism', 'Tourism', 'Assam', 91),
('Local Restaurants', 'Directory', 'Guwahati', 66),
('Wildlife Photography', 'Adventure', 'Kaziranga', 41),
('Cultural Heritage', 'Culture', 'Sivasagar', 55);

-- Wildlife Table
INSERT INTO wildlife (name, description, location, district, latitude, longitude, best_season, entry_fee, opening_hours, animal_species, conservation_status, image_urls, contact_info) VALUES
('Kaziranga National Park', 'Home to the one-horned rhinoceros', 'Golaghat', 'Golaghat', 26.5962, 93.0095, 'November-April', 50.00, '7:00 AM - 5:00 PM', 'One-horned Rhinoceros, Bengal Tiger, Asian Elephant', 'UNESCO World Heritage Site', 'kaziranga1.jpg,kaziranga2.jpg', '+91 3776 262421'),
('Manas National Park', 'Biodiversity hotspot and tiger reserve', 'Baksa', 'Baksa', 26.7271, 90.8721, 'November-April', 40.00, '6:30 AM - 4:30 PM', 'Royal Bengal Tiger, Golden Langur, Pygmy Hog', 'UNESCO World Heritage Site', 'manas1.jpg,manas2.jpg', '+91 3666 274037'),
('Dibru-Saikhowa National Park', 'Unique riverine forest ecosystem', 'Tinsukia', 'Tinsukia', 27.3889, 95.3889, 'November-March', 30.00, '7:00 AM - 5:00 PM', 'Hoolock Gibbon, Gangetic Dolphin, Wild Buffalo', 'Biodiversity Hotspot', 'dibru1.jpg,dibru2.jpg', '+91 3775 244148'),
('Orang National Park', 'Mini Kaziranga of Assam', 'Darrang', 'Darrang', 26.4833, 92.3167, 'November-April', 25.00, '7:00 AM - 5:00 PM', 'One-horned Rhinoceros, Tiger, Elephant', 'National Park', 'orang1.jpg,orang2.jpg', '+91 3715 252423'),
('Nameri National Park', 'Pristine forest and river ecosystem', 'Sonitpur', 'Sonitpur', 26.8167, 92.7167, 'November-March', 35.00, '6:30 AM - 4:30 PM', 'White-winged Wood Duck, Tiger, Elephant', 'Eco-sensitive Zone', 'nameri1.jpg,nameri2.jpg', '+91 3712 225240'),
('Pobitora Wildlife Sanctuary', 'High density of one-horned rhinos', 'Morigaon', 'Morigaon', 26.1167, 92.0167, 'November-April', 20.00, '6:00 AM - 4:00 PM', 'One-horned Rhinoceros, Wild Buffalo', 'Wildlife Sanctuary', 'pobitora1.jpg,pobitora2.jpg', '+91 3678 225240'),
('Garampani Wildlife Sanctuary', 'Hot spring and wildlife habitat', 'Golaghat', 'Golaghat', 26.3833, 93.9667, 'October-March', 15.00, '7:00 AM - 5:00 PM', 'Hoolock Gibbon, Capped Langur', 'Wildlife Sanctuary', 'garampani1.jpg,garampani2.jpg', '+91 3776 262421'),
('Bornadi Wildlife Sanctuary', 'Himalayan foothills ecosystem', 'Baksa', 'Baksa', 26.6167, 90.5667, 'November-March', 10.00, '6:30 AM - 4:30 PM', 'Pygmy Hog, Hispid Hare', 'Wildlife Sanctuary', 'bornadi1.jpg,bornadi2.jpg', '+91 3666 274037'),
('Panidihing Bird Sanctuary', 'Migratory bird paradise', 'Sivasagar', 'Sivasagar', 26.9833, 94.6333, 'November-February', 5.00, '6:00 AM - 4:00 PM', 'Bar-headed Goose, Spot-billed Pelican', 'Bird Sanctuary', 'panidihing1.jpg,panidihing2.jpg', '+91 3772 252240'),
('Chakrashila Wildlife Sanctuary', 'Golden Langur conservation', 'Kokrajhar', 'Kokrajhar', 26.2833, 90.5333, 'October-March', 15.00, '7:00 AM - 5:00 PM', 'Golden Langur, Hoolock Gibbon', 'Wildlife Sanctuary', 'chakrashila1.jpg,chakrashila2.jpg', '+91 3667 274037');

-- Culture Table
INSERT INTO culture (name, type, description, location, district, start_date, end_date, historical_significance, cultural_importance, image_urls, contact_info) VALUES
('Bihu Festival', 'Festival', 'Traditional Assamese harvest festival', 'Guwahati', 'Kamrup', '2024-04-14', '2024-04-15', 'Celebrated since ancient times', 'Marks Assamese New Year', 'bihu1.jpg,bihu2.jpg', '+91 361 2547890'),
('Majuli Raas Leela', 'Dance', 'Traditional Krishna dance drama', 'Majuli', 'Majuli', '2024-11-20', '2024-11-22', 'Centuries-old Vaishnavite tradition', 'Preserves cultural heritage', 'raas1.jpg,raas2.jpg', '+91 3775 262421'),
('Ambubachi Mela', 'Festival', 'Annual festival at Kamakhya Temple', 'Guwahati', 'Kamrup', '2024-06-22', '2024-06-26', 'Celebrates feminine power', 'Important tantric tradition', 'ambubachi1.jpg,ambubachi2.jpg', '+91 361 2632281'),
('Bohag Bihu', 'Tradition', 'Spring festival of Assam', 'Across Assam', 'Multiple', '2024-04-14', '2024-04-15', 'Agricultural celebration', 'Marks beginning of agricultural season', 'bohag1.jpg,bohag2.jpg', '+91 361 2547890'),
('Rongali Bihu', 'Festival', 'Assamese New Year celebration', 'Across Assam', 'Multiple', '2024-04-14', '2024-04-15', 'Harvest and renewal festival', 'Cultural identity marker', 'rongali1.jpg,rongali2.jpg', '+91 361 2547890'),
('Assam Tea Festival', 'Festival', 'Celebration of tea culture', 'Jorhat', 'Jorhat', '2024-11-15', '2024-11-17', 'Highlights tea industry', 'Promotes local tea culture', 'tea_festival1.jpg,tea_festival2.jpg', '+91 376 2304567'),
('Brahmaputra Beach Festival', 'Cultural Event', 'River and beach cultural celebration', 'Guwahati', 'Kamrup', '2024-01-10', '2024-01-12', 'Promotes river culture', 'Highlights Brahmaputra significance', 'beach_festival1.jpg,beach_festival2.jpg', '+91 361 2547890'),
('Jonbeel Mela', 'Traditional Fair', 'Ancient barter system fair', 'Jagiroad', 'Morigaon', '2024-01-15', '2024-01-17', 'Centuries-old trading tradition', 'Preserves traditional exchange system', 'jonbeel1.jpg,jonbeel2.jpg', '+91 3678 255678'),
('Dehing Patkai Festival', 'Cultural Festival', 'Celebration of indigenous cultures', 'Dibrugarh', 'Dibrugarh', '2024-02-20', '2024-02-22', 'Highlights tribal diversity', 'Promotes cultural unity', 'dehing1.jpg,dehing2.jpg', '+91 373 2304567'),
('Bwisagu Festival', 'Festival', 'Bodo New Year celebration', 'Kokrajhar', 'Kokrajhar', '2024-04-01', '2024-04-02', 'Bodo tribal new year', 'Cultural identity celebration', 'bwisagu1.jpg,bwisagu2.jpg', '+91 3667 274037');

-- Continue with other tables in similar fashion...
-- (Note: I'll provide a summary of the approach for brevity)

-- Approach for other tables:
-- 1. Use realistic, Assam-specific data
-- 2. Provide diverse entries
-- 3. Include meaningful descriptions
-- 4. Use local contact information
-- 5. Add relevant images and details

-- Would you like me to continue with the full dummy data for all tables?
-- The complete script would be quite long, so I can generate it in parts or provide a full version if needed.

-- Recommendation: 
-- 1. Confirm you want full dummy data
-- 2. Specify if you want variations in data
-- 3. Indicate any specific requirements for other tables