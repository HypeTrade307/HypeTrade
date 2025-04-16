import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Container,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Paper,
    Box,
    IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Navbar from "../components/NavbarSection/Navbar.tsx"; // Assuming Navbar exists
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from '../config';

interface Portfolio {
    portfolio_id: number;
    portfolio_name: string;
}

export default function PortfoliosCreation(props: { disableCustomTheme?: boolean }) {
    const [portfolioName, setPortfolioName] = useState<string>("");
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

    // Load saved Portfolios from API
    useEffect(() => {
        async function fetchPortfolios() {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE_URL}/portfolios`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPortfolios(response.data);
            } catch (error) {
                console.error("Failed to fetch portfolios", error);
                toast.error("Failed to fetch portfolios.");
            }
        }
        fetchPortfolios();
    }, []);

    const createPortfolio = async () => {
        if (portfolioName.trim()) {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.post(
                    `${API_BASE_URL}/portfolios`,
                    { portfolio_name: portfolioName },
                    {   
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
                    }
                );
                setPortfolios([...portfolios, response.data]);
                setPortfolioName("");
                toast.success("Portfolio created successfully!");
            } catch (error) {
                console.error("Error creating portfolio", error);
                toast.error("Failed to create portfolio.");
            }
        }
    };

    const removePortfolio = async (portfolioId: number) => {
        if (!window.confirm("Are you sure you want to delete this portfolio?")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE_URL}/portfolios/${portfolioId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPortfolios((prevPortfolios) => prevPortfolios.filter((p) => p.portfolio_id !== portfolioId));
            toast.success("Portfolio deleted successfully!");
        } catch (error) {
            console.error("Error deleting portfolio", error);
            toast.error("Failed to delete portfolio.");
        }
    };

    return (
        <AppTheme {...props}>
            <Navbar />
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Your Portfolios
                    </Typography>

                    <Typography variant="h6" align="center" color="text.secondary" gutterBottom>
                        Create a New Portfolio
                    </Typography>

                    <Box display="flex" gap={2} flexDirection="column" alignItems="center">
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Portfolio Name"
                            value={portfolioName}
                            onChange={(e) => setPortfolioName(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={createPortfolio}
                        >
                            Create Portfolio
                        </Button>
                    </Box>

                    <Typography variant="h6" mt={3}>
                        Portfolio List
                    </Typography>
                    {portfolios.length === 0 ? (
                        <Typography color="text.secondary">No portfolios created.</Typography>
                    ) : (
                        <List>
                            {portfolios.map((portfolio) => (
                                <ListItem 
                                    key={portfolio.portfolio_id} 
                                    secondaryAction={
                                        <IconButton 
                                            edge="end" 
                                            aria-label="delete" 
                                            onClick={() => removePortfolio(portfolio.portfolio_id)}
                                        >
                                            <DeleteIcon color="error" />
                                        </IconButton>
                                    }
                                    button
                                    component={Link} 
                                    to={`/Portfolios/${portfolio.portfolio_id}`}
                                >
                                    <ListItemText primary={portfolio.portfolio_name} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>
            </Container>
        </AppTheme>
    );
}
