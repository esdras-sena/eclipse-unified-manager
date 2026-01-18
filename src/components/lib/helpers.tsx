export const formatCurrency = (currency: any) => {
    let amount = currency / 1e18;
    return amount || 0;
}