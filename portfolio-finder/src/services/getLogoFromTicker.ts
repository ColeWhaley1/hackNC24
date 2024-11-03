const getLogoFromTicker = async (
    ticker: string
) => {

    try {
        const response = await fetch("http://localhost:5001/api/get_logo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ticker: ticker
            })
        });

        if(!response.ok) {
            throw new Error("can't call api get logo");
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error);
    }
}

export default getLogoFromTicker;