import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Vistoria } from '../types/vistoria';

// Estilos específicos para o PDF (parecido com CSS, mas próprio para impressão)
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { fontSize: 22, marginBottom: 20, textAlign: 'center', fontWeight: 'bold', color: '#0056b3' },
  section: { marginBottom: 15 },
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  value: { fontSize: 12, marginBottom: 8, lineHeight: 1.5 },
  divisor: { borderBottom: '1px solid #ccc', marginVertical: 15 },
  fotosContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  fotoWrapper: { width: '48%', marginBottom: 10 },
  foto: { width: '100%', height: 200, objectFit: 'cover' }
});

interface Props {
  vistoria: Partial<Vistoria>;
}

// Este é o "desenho" da folha A4
export function RelatorioPDF({ vistoria }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Relatório de Vistoria de Imóvel</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Título da Vistoria:</Text>
          <Text style={styles.value}>{vistoria.titulo}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Endereço:</Text>
          <Text style={styles.value}>{vistoria.endereco}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Data da Vistoria:</Text>
          <Text style={styles.value}>
            {vistoria.dataVistoria ? new Date(vistoria.dataVistoria).toLocaleDateString('pt-BR') : ''}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Observações:</Text>
          <Text style={styles.value}>{vistoria.observacoes}</Text>
        </View>

        <View style={styles.divisor} />

        <Text style={styles.label}>Registo Fotográfico:</Text>
        <View style={styles.fotosContainer}>
          {/* Percorre a lista de fotos e coloca-as lado a lado no PDF */}
          {vistoria.fotos?.map((foto, index) => (
            <View key={index} style={styles.fotoWrapper}>
              <Image src={foto.url} style={styles.foto} />
            </View>
          ))}
        </View>

      </Page>
    </Document>
  );
}