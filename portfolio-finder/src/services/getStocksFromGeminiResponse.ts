const parseGeminiResponse = (gemini_response: string) => {
    const split_data: string[] = gemini_response.split(",");

    const split_data_nums: number[] = [];

    for (let i = 0; i < split_data.length; i++) {
        const stripped_element = split_data[i].replace(/\D/g, '');
        split_data_nums.push(Number(stripped_element));
    }

    const horizon: number = split_data_nums[0];
    const risk: number = split_data_nums[1];
    const ohv: number[] = split_data_nums.slice(2);


    return {
        horizon,
        risk,
        ohv
    };
}

const getStocksFromGeminiReponse = async (
    gemini_response: string
) => {
    const filter_data = parseGeminiResponse(gemini_response);

    try {
        console.log(JSON.stringify(filter_data))
        const response = await fetch("http://localhost:5001/api/filter_stocks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(filter_data)
        });

        if(!response.ok) {
            throw new Error("can't call api filter stocks");
        }

        const result = await response.json();
        console.log(result);
        return result;
    } catch (error) {
        
    }

    // try {
    //     const response = await fetch(url, {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify(data),
    //     });

    //     if (!response.ok) {
    //         throw new Error(`HTTP error! Status: ${response.status}`);
    //     }

    //     const result: FilterStocksResponse = await response.json();
    //     console.log("API Response:", result);
    //     return result;
    // } catch (error) {
    //     console.error("Error calling filter stocks API:", error);
    // }
}

export default getStocksFromGeminiReponse;