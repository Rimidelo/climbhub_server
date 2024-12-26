import Gym from '../models/gym.js'; // Adjust the path as necessary

// Controller to get all gyms
const getGyms = async (req, res) => {
    try {
        const gyms = await Gym.find();
        res.status(200).json(gyms);
    } catch (err) {
        console.error('Error fetching gyms:', err);
        res.status(500).json({ error: 'Failed to load gyms.' });
    }
};

// Controller to create a new gym
const createGym = async (req, res) => {
    try {
        const { name, location, facilities } = req.body;

        // Validate required fields
        if (!name || !location) {
            return res.status(400).json({ error: 'Name and location are required' });
        }

        const newGym = new Gym({
            name,
            location,
            facilities,
        });

        const savedGym = await newGym.save();
        res.status(201).json(savedGym);
    } catch (error) {
        console.error('Error creating gym:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Controller to get a gym by ID
const getGym = async (req, res) => {
    try {
        const gym = await Gym.findById(req.params.id);

        if (!gym) {
            return res.status(404).json({ error: 'Gym not found' });
        }

        res.json(gym);
    } catch (error) {
        console.error('Error fetching gym:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Controller to update a gym by ID
const updateGym = async (req, res) => {
    try {
        const updatedGym = await Gym.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedGym) {
            return res.status(404).json({ error: 'Gym not found' });
        }

        res.json(updatedGym);
    } catch (error) {
        console.error('Error updating gym:', error);
        res.status(400).json({ error: 'Invalid data' });
    }
};

// Controller to delete a gym by ID
const deleteGym = async (req, res) => {
    try {
        const deletedGym = await Gym.findByIdAndRemove(req.params.id);

        if (!deletedGym) {
            return res.status(404).json({ error: 'Gym not found' });
        }

        res.json({ message: 'Gym deleted successfully' });
    } catch (error) {
        console.error('Error deleting gym:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export { getGyms, createGym, getGym, updateGym, deleteGym };