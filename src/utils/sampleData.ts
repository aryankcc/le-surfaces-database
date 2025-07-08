
export const sampleSlabs = [
  // Current Inventory - Fundamental Calacatta family
  {
    slab_id: "1A",
    family: "Fundamental Calacatta",
    formulation: "Sereno Bianco",
    version: "1",
    received_date: "2024-01-15",
    status: "in_stock",
    category: "current",
    quantity: 3,
    image_url: "https://images.unsplash.com/photo-1615876063886-8e01f2c8d2c7?w=500&h=500&fit=crop",
    notes: "High-quality marble with excellent veining patterns"
  },
  {
    slab_id: "2B",
    family: "Fundamental Calacatta",
    formulation: "Oro Venato",
    version: "2",
    received_date: "2024-01-20",
    status: "in_stock",
    category: "current",
    quantity: 2,
    image_url: "https://images.unsplash.com/photo-1615876063886-8e01f2c8d2c7?w=500&h=500&fit=crop",
    notes: "Premium grade with gold veining"
  },
  
  // Current Inventory - Carrara family
  {
    slab_id: "3C",
    family: "Carrara",
    formulation: "Bianco Classico",
    version: "1",
    received_date: "2024-02-01",
    status: "in_stock",
    category: "current",
    quantity: 5,
    image_url: "https://images.unsplash.com/photo-1615876063886-8e01f2c8d2c7?w=500&h=500&fit=crop",
    notes: "Classic white marble with subtle gray veining"
  },
  {
    slab_id: "4D",
    family: "Carrara",
    formulation: "Statuario",
    version: "1",
    received_date: "2024-02-10",
    status: "sent",
    category: "current",
    quantity: 1,
    sent_to_location: "Austin Showroom",
    sent_to_date: "2024-02-15",
    image_url: "https://images.unsplash.com/photo-1615876063886-8e01f2c8d2c7?w=500&h=500&fit=crop",
    notes: "Premium Statuario marble sent to showroom"
  },
  {
    slab_id: "5E",
    family: "Carrara",
    formulation: "Venato",
    version: "3",
    received_date: "2024-02-20",
    status: "not_in_yet",
    category: "current",
    quantity: 0,
    notes: "Expected delivery next week"
  },
  
  // Development Slabs - Experimental Series
  {
    slab_id: "DEV1",
    family: "Experimental Series",
    formulation: "Quantum Quartz",
    version: "A",
    received_date: "2024-03-01",
    status: "in_stock",
    category: "development",
    quantity: 1,
    image_url: "https://images.unsplash.com/photo-1615876063886-8e01f2c8d2c7?w=500&h=500&fit=crop",
    notes: "Experimental quartz blend with unique properties"
  },
  {
    slab_id: "DEV2",
    family: "Experimental Series",
    formulation: "Neo Marble",
    version: "B",
    received_date: "2024-03-05",
    status: "in_stock",
    category: "development",
    quantity: 2,
    image_url: "https://images.unsplash.com/photo-1615876063886-8e01f2c8d2c7?w=500&h=500&fit=crop",
    notes: "Synthetic marble with enhanced durability"
  },
  
  // Development Slabs - Future Concepts
  {
    slab_id: "FC1",
    family: "Future Concepts",
    formulation: "Holographic Surface",
    version: "1",
    received_date: "2024-03-10",
    status: "in_stock",
    category: "development",
    quantity: 1,
    image_url: "https://images.unsplash.com/photo-1615876063886-8e01f2c8d2c7?w=500&h=500&fit=crop",
    notes: "Prototype with color-changing properties"
  },
  {
    slab_id: "FC2",
    family: "Future Concepts",
    formulation: "Bio-Composite",
    version: "2",
    received_date: "2024-03-15",
    status: "sent",
    category: "development",
    quantity: 1,
    sent_to_location: "R&D Lab",
    sent_to_date: "2024-03-20",
    image_url: "https://images.unsplash.com/photo-1615876063886-8e01f2c8d2c7?w=500&h=500&fit=crop",
    notes: "Eco-friendly composite material testing"
  },
  {
    slab_id: "FC3",
    family: "Future Concepts",
    formulation: "Smart Surface",
    version: "1",
    received_date: "2024-03-25",
    status: "discontinued",
    category: "development",
    quantity: 0,
    notes: "Project discontinued due to cost constraints"
  }
];

export const insertSampleData = async () => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    console.log('Inserting sample data...');
    
    // Check if data already exists
    const { data: existingData, error: checkError } = await supabase
      .from('slabs')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking existing data:', checkError);
      return;
    }
    
    if (existingData && existingData.length > 0) {
      console.log('Sample data already exists, skipping insertion');
      return;
    }
    
    // Insert sample data
    const { data, error } = await supabase
      .from('slabs')
      .insert(sampleSlabs);
    
    if (error) {
      console.error('Error inserting sample data:', error);
      throw error;
    }
    
    console.log('Sample data inserted successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to insert sample data:', error);
    throw error;
  }
};
