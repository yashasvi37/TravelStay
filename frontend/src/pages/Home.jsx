import { useEffect, useState } from "react";
import api from "../lib/axios";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Home = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchListings = async (currentCursor = null) => {
        try {
            const params = { limit: 20 };
            if (currentCursor) params.cursor = currentCursor;
            const res = await api.get("/listings", { params });

            // Defensive: backend returns { data, nextCursor, hasMore }
            // Guard against old array response or unexpected shapes
            const payload = res.data;
            const incoming = Array.isArray(payload?.data) ? payload.data
                           : Array.isArray(payload)       ? payload
                           : [];

            setListings(prev => currentCursor ? [...prev, ...incoming] : incoming);
            setCursor(payload?.nextCursor ?? null);
            setHasMore(payload?.hasMore ?? false);
        } catch (err) {
            console.error("Failed to fetch listings", err);
            setError("Could not load listings. The server may be waking up — please try again in a moment.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleLoadMore = () => {
        setLoadingMore(true);
        fetchListings(cursor);
    };

    if (loading) return <div className="spinner"></div>;

    if (error) return (
        <div className="container" style={{ textAlign: "center", marginTop: "60px" }}>
            <p style={{ color: "#d32f2f", marginBottom: "16px" }}>{error}</p>
            <button
                className="btn-primary"
                onClick={() => { setError(null); setLoading(true); fetchListings(); }}
            >
                Retry
            </button>
        </div>
    );

    return (
        <div className="container">
            <Helmet>
                <title>TravelStay — Find your next adventure</title>
                <meta name="description" content="Discover and book amazing homes, apartments, and unique places to stay around the world with TravelStay." />
            </Helmet>

            {listings.length === 0 ? (
                <div style={{ textAlign: "center", marginTop: "60px", color: "#888" }}>
                    No listings found.
                </div>
            ) : (
                <div className="listings-grid">
                    {listings.map((listing) => (
                        <Link to={`/listings/${listing._id}`} key={listing._id} className="listing-card">
                            <div className="card-img-container">
                                <img src={listing.image?.url} alt={listing.title} className="card-img" />
                            </div>
                            <div className="card-info">
                                <div className="card-title">{listing.title}</div>
                                <div className="card-loc">{listing.location}, {listing.country}</div>
                                <div className="card-price">
                                    <span className="price-bold">&#8377; {listing.price?.toLocaleString("en-IN")}</span> night
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {hasMore && (
                <div style={{ textAlign: "center", margin: "32px 0" }}>
                    <button
                        className="btn-primary"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                    >
                        {loadingMore ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;
