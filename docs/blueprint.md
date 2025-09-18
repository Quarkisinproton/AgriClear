# **App Name**: AgriTrack

## Core Features:

- Farmer: Produce Listing: Farmers can list new produce batches with name and number of units.
- Farmer: Harvest Submission: Submit a new batch of produce to the 'produce' collection in Firestore with a 'Harvested' status.
- Middleman: Harvested Batches: Middlemen can view all produce batches with 'Harvested' status.
- Middleman: Process Shipping: Middlemen can update the produce status to 'Processed' when preparing for shipping.
- Middleman: QR Code Generation Tool: Generate QR codes containing product ID. Tool ensures to only expose data necessary and helpful to the recipient and generate correct syntax and form for a proper, machine readable QR code.
- Consumer: Scan/Enter Product ID: Consumers can manually enter a Product ID to view product details.
- Consumer: Product Tracking: Display product name, units, and status history for consumers.

## Style Guidelines:

- Primary color: Earthy green (#8FBC8F) for a natural, organic feel.
- Background color: Light beige (#F5F5DC) for a neutral backdrop.
- Accent color: Warm brown (#A0522D) for buttons and interactive elements.
- Font: 'PT Sans', a sans-serif, for clear and modern readability in the app.
- Use farm-themed icons for produce and user roles.
- Clean and simple layouts for easy navigation between roles and product information.
- Smooth transitions and loading animations for an engaging user experience.