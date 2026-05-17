import pandas as pd
import json
import calendar
import sys
import os

def calculate_pasture_costs(json_file_path):
    """
    Calculates the average active animals (> 8 months) per month in 2024
    and the associated pasture costs (20.000 COP/animal/month).
    """
    if not os.path.exists(json_file_path):
        print(f"Error: El archivo {json_file_path} no existe.")
        return

    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error al leer el JSON: {e}")
        return

    # Handle both single list or firebase-style object with 'animals' key
    if isinstance(data, dict) and 'animals' in data:
        animals_list = data['animals']
    elif isinstance(data, list):
        animals_list = data
    else:
        print("Error: Formato de JSON no reconocido. Se esperaba una lista o un objeto con la llave 'animals'.")
        return

    df = pd.DataFrame(animals_list)
    
    if df.empty:
        print("El archivo JSON no contiene registros de animales.")
        return

    # Convert date columns to datetime
    # The app uses YYYY-MM-DD format from HTML5 date inputs
    date_cols = ['date_of_birth', 'acquisition_date', 'sale_date', 'death_date']
    for col in date_cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
        else:
            df[col] = pd.NaT

    results = []
    
    # Iterate through months of 2024
    for month in range(1, 13):
        month_start = pd.Timestamp(2023, month, 1)
        last_day = calendar.monthrange(2023, month)[1]
        month_end = pd.Timestamp(2023, month, last_day)
        
        # Logic for "Active in Month":
        # 1. Animal must have been acquired on or before the end of this month.
        # 2. Animal must NOT have been sold or died BEFORE the start of this month.
        #    (If sold/died during the month, we count them for that month's pasture).
        
        mask_acquired = df['acquisition_date'] <= month_end
        
        # Not sold before the start of the month
        mask_not_sold = (df['status'] != 'Vendido') | (df['sale_date'] >= month_start)
        # Not dead before the start of the month
        mask_not_dead = (df['status'] != 'Muerto') | (df['death_date'] >= month_start)
        
        # Age criteria: > 8 months at the end of the month
        # 8 months is approx 8 * 30.44 = 243.5 days
        def is_old_enough(row):
            if pd.isna(row['date_of_birth']):
                return False
            age_days = (month_end - row['date_of_birth']).days
            return age_days > (8 * 30.44)

        mask_age = df.apply(is_old_enough, axis=1)
        
        active_animals = df[mask_acquired & mask_not_sold & mask_not_dead & mask_age]
        
        count = len(active_animals)
        cost = count * 20000
        
        results.append({
            'Mes': month_start.strftime('%B %Y'),
            'Animales > 8m': count,
            'Costo Pastoreo (COP)': f"{cost:,.0f}"
        })
        
    report_df = pd.DataFrame(results)
    
    # Calculate averages for the summary
    numeric_counts = [r['Animales > 8m'] for r in results]
    avg_animals = sum(numeric_counts) / 12
    total_cost = sum([int(r['Costo Pastoreo (COP)'].replace(',', '')) for r in results])
    
    print("\n" + "="*45)
    print("   REPORTE DE COSTOS DE PASTOREO - 2024")
    print("="*45)
    print(report_df.to_string(index=False))
    print("-" * 45)
    print(f"Promedio de animales mensuales: {avg_animals:.2f}")
    print(f"COSTO TOTAL ANUAL: ${total_cost:,.0f} COP")
    print("="*45 + "\n")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        calculate_pasture_costs(sys.argv[1])
    else:
        print("Uso: python pasture_calculation.py <ruta_al_archivo_exportado.json>")
        print("Ejemplo: python pasture_calculation.py animales_backup.json")
